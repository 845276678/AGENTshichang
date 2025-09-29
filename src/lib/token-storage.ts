/**
 * Token Storage Utility
 * Handles secure storage and retrieval of JWT tokens
 */

import { TokenPair } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'auth.access_token';
const REFRESH_TOKEN_KEY = 'auth.refresh_token';
const USER_KEY = 'auth.user';

/**
 * Secure token storage class with localStorage fallback
 */
class TokenStorage {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Store tokens securely
   */
  setTokens(tokens: TokenPair): void {
    if (!this.isClient) {return;}

    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token with fallback to legacy storage
   */
  getAccessToken(): string | null {
    if (!this.isClient) {return null;}

    try {
      // 首先检查标准位置
      let token = localStorage.getItem(ACCESS_TOKEN_KEY);

      // 如果没有找到，检查兼容性位置
      if (!token) {
        token = localStorage.getItem('access_token') || localStorage.getItem('auth_token');

        // 如果在兼容性位置找到了token，迁移到标准位置
        if (token) {
          localStorage.setItem(ACCESS_TOKEN_KEY, token);
          // 清理旧的位置
          localStorage.removeItem('access_token');
          localStorage.removeItem('auth_token');
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token with fallback to legacy storage
   */
  getRefreshToken(): string | null {
    if (!this.isClient) {return null;}

    try {
      // 首先检查标准位置
      let token = localStorage.getItem(REFRESH_TOKEN_KEY);

      // 如果没有找到，检查兼容性位置
      if (!token) {
        token = localStorage.getItem('refresh_token');

        // 如果在兼容性位置找到了token，迁移到标准位置
        if (token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, token);
          // 清理旧的位置
          localStorage.removeItem('refresh_token');
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get both tokens as a pair
   */
  getTokens(): TokenPair | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  /**
   * Clear all stored tokens and user data
   */
  clearTokens(): void {
    if (!this.isClient) {return;}

    try {
      // 清理标准位置
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // 清理兼容性位置
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Store user data
   */
  setUser(user: any): void {
    if (!this.isClient) {return;}

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data with fallback to legacy storage
   */
  getUser(): any | null {
    if (!this.isClient) {return null;}

    try {
      // 首先检查标准位置
      let userData = localStorage.getItem(USER_KEY);

      // 如果没有找到，检查兼容性位置
      if (!userData) {
        userData = localStorage.getItem('user_data');

        // 如果在兼容性位置找到了数据，迁移到标准位置
        if (userData) {
          localStorage.setItem(USER_KEY, userData);
          // 清理旧的位置
          localStorage.removeItem('user_data');
        }
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if tokens exist
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  /**
   * Decode JWT token payload (client-side only, for convenience)
   */
  decodeToken(token: string): any | null {
    try {
      const parts = token.split('.')
      if (parts.length < 2) {
        throw new Error('Invalid token format')
      }
      const base64Url = parts[1];;
      if (!base64Url) {
        throw new Error('Invalid token format')
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {return true;}

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {return true;}
    return this.isTokenExpired(token);
  }

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    if (!token) {return true;}
    return this.isTokenExpired(token);
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {return null;}
    return new Date(payload.exp * 1000);
  }

  /**
   * Subscribe to storage changes (for cross-tab sync)
   */
  onStorageChange(callback: (event: StorageEvent) => void): () => void {
    if (!this.isClient) {return () => {};}

    const handler = (event: StorageEvent) => {
      if ([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY].includes(event.key || '')) {
        callback(event);
      }
    };

    window.addEventListener('storage', handler);
    
    return () => {
      window.removeEventListener('storage', handler);
    };
  }

  /**
   * Clear all auth-related data
   */
  clearAll(): void {
    this.clearTokens();
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
export default tokenStorage;



