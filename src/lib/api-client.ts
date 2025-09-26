/**
 * API Client with Authentication
 * Handles HTTP requests with automatic token management and refresh
 */

import { 
  AuthResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ApiError,
  AuthErrorCodes,
  RateLimitInfo,
  User
} from '@/types/auth';
import { tokenStorage } from './token-storage';

/**
 * Custom error class for API errors
 */
export class ApiErrorClass extends Error implements ApiError {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiErrorClass);
    }
  }
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 8000; // 8 seconds default to avoid blocking UI

interface RequestConfig extends RequestInit {
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  rateLimit?: RateLimitInfo;
}

/**
 * API Client class with authentication handling
 */
class ApiClient {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Create request with timeout
   */
  private async requestWithTimeout(
    url: string, 
    config: RequestConfig = {}
  ): Promise<Response> {
    const { timeout = API_TIMEOUT, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiErrorClass('Request timeout', 'TIMEOUT', 408);
      }
      throw error;
    }
  }

  /**
   * Parse rate limit headers
   */
  private parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const retryAfter = headers.get('Retry-After');

    if (limit && remaining && reset) {
      return {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        ...(retryAfter ? { retryAfter: parseInt(retryAfter) } : {})
      } as RateLimitInfo;
    }

    return undefined;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const rateLimit = this.parseRateLimitHeaders(response.headers);

    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error = new ApiErrorClass(
        data.message || `HTTP ${response.status}`,
        data.code || this.getErrorCodeFromStatus(response.status),
        response.status,
        data.details || data
      );
      throw error;
    }

    return {
      ...data,
      rateLimit,
    };
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 400: return AuthErrorCodes.VALIDATION_ERROR;
      case 401: return AuthErrorCodes.INVALID_CREDENTIALS;
      case 403: return AuthErrorCodes.ACCOUNT_SUSPENDED;
      case 404: return AuthErrorCodes.USER_NOT_FOUND;
      case 429: return AuthErrorCodes.RATE_LIMIT_EXCEEDED;
      default: return AuthErrorCodes.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(): Promise<string> {
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new ApiErrorClass('No refresh token available', AuthErrorCodes.INVALID_TOKEN, 401);
    }

    if (tokenStorage.isRefreshTokenExpired()) {
      tokenStorage.clearTokens();
      throw new ApiErrorClass('Refresh token expired', AuthErrorCodes.EXPIRED_TOKEN, 401);
    }

    try {
      const response = await this.requestWithTimeout(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });

      const result = await this.handleResponse<RefreshTokenResponse>(response);
      const newAccessToken = result.data?.accessToken;

      if (!newAccessToken) {
        throw new ApiErrorClass('Invalid refresh response', AuthErrorCodes.INVALID_TOKEN, 401);
      }

      // Update stored tokens
      tokenStorage.setTokens({
        accessToken: newAccessToken,
        refreshToken, // Keep existing refresh token
      });

      return newAccessToken;
    } catch (error) {
      tokenStorage.clearTokens();
      throw error;
    }
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { retryCount = 0, skipAuth = false, ...fetchConfig } = config;
    const url = `${this.baseURL}${endpoint}`;

    // Add authentication header if not skipped
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers as Record<string, string>,
    };

    if (!skipAuth) {
      let accessToken = tokenStorage.getAccessToken();
      
      // Refresh token if expired
      if (accessToken && tokenStorage.isAccessTokenExpired()) {
        try {
          accessToken = await this.refreshAccessToken();
        } catch (error) {
          // Token refresh failed, proceed without auth
          accessToken = null;
        }
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    try {
      const response = await this.requestWithTimeout(url, {
        ...fetchConfig,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry on token expiration (only once)
      if (
        error instanceof ApiErrorClass && 
        error.status === 401 && 
        !skipAuth && 
        retryCount === 0
      ) {
        try {
          await this.refreshAccessToken();
          return this.request<T>(endpoint, { ...config, retryCount: 1 });
        } catch (refreshError) {
          // Refresh failed, return original error
          throw error;
        }
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      ...(data ? { body: JSON.stringify(data) } : {})
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      ...(data ? { body: JSON.stringify(data) } : {})
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      ...(data ? { body: JSON.stringify(data) } : {})
    });
  }

  // Authentication API methods
  
  /**
   * User login
   */
  async login(data: LoginRequest): Promise<AuthResponse<LoginResponse>> {
    return this.post<LoginResponse>('/api/auth/login', data, { skipAuth: true });
  }

  /**
   * User registration
   */
  async register(data: RegisterRequest): Promise<AuthResponse<RegisterResponse>> {
    return this.post<RegisterResponse>('/api/auth/register', data, { skipAuth: true });
  }

  /**
   * Logout user
   */
  async logout(): Promise<AuthResponse> {
    const refreshToken = tokenStorage.getRefreshToken();
    const result = await this.post('/api/auth/logout', { refreshToken });
    tokenStorage.clearTokens();
    return result;
  }

  /**
   * Refresh access token
   */
  async refresh(data: RefreshTokenRequest): Promise<AuthResponse<RefreshTokenResponse>> {
    return this.post<RefreshTokenResponse>('/api/auth/refresh', data, { skipAuth: true });
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    return this.post('/api/auth/forgot-password', data, { skipAuth: true });
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    return this.post('/api/auth/reset-password', data, { skipAuth: true });
  }

  /**
   * Verify email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    return this.post('/api/auth/verify-email', data, { skipAuth: true });
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<AuthResponse<User>> {
    return this.get<User>('/api/auth/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<AuthResponse<User>> {
    return this.patch<User>('/api/auth/profile', data);
  }

  /**
   * Change password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<AuthResponse> {
    return this.post('/api/auth/change-password', data);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<AuthResponse> {
    return this.post('/api/auth/resend-verification');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
