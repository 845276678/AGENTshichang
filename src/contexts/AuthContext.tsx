/**
 * Authentication Context
 * Global authentication state management using React Context + useReducer
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  User,
  TokenPair,
  LoginRequest,
  RegisterRequest,
  ApiError
} from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

const AUTH_CHECK_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_AUTH_CHECK_TIMEOUT ?? '5000');
const AUTH_CHECK_MODE = process.env.NEXT_PUBLIC_AUTH_CHECK_MODE ?? 'auto';

// Auth State Interface
export interface AuthState {
  // User and authentication status
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // UI states
  isLoggingIn: boolean;
  isRegistering: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
  lastError: { message: string; code?: string } | null;
  
  // Session info
  sessionExpiry: Date | null;
  lastActivity: Date | null;
}

// Auth Actions
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATION'; payload: { user: User; tokens: TokenPair } }
  | { type: 'SET_LOGIN_LOADING'; payload: boolean }
  | { type: 'SET_REGISTER_LOADING'; payload: boolean }
  | { type: 'SET_REFRESH_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { error: string; apiError?: { message: string; code?: string } } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_LAST_ACTIVITY' }
  | { type: 'SET_SESSION_EXPIRY'; payload: Date | null };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  isLoggingIn: false,
  isRegistering: false,
  isRefreshing: false,
  error: null,
  lastError: null,
  sessionExpiry: null,
  lastActivity: new Date(),
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error, // Clear error when loading starts
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
        lastError: null,
      };

    case 'SET_AUTHENTICATION':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        isLoggingIn: false,
        isRegistering: false,
        error: null,
        lastError: null,
        lastActivity: new Date(),
      };

    case 'SET_LOGIN_LOADING':
      return {
        ...state,
        isLoggingIn: action.payload,
        error: action.payload ? null : state.error,
      };

    case 'SET_REGISTER_LOADING':
      return {
        ...state,
        isRegistering: action.payload,
        error: action.payload ? null : state.error,
      };

    case 'SET_REFRESH_LOADING':
      return {
        ...state,
        isRefreshing: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        lastError: action.payload.apiError || null,
        isLoading: false,
        isLoggingIn: false,
        isRegistering: false,
        isRefreshing: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        lastError: null,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isInitialized: state.isInitialized,
        lastActivity: new Date(),
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };

    case 'SET_SESSION_EXPIRY':
      return {
        ...state,
        sessionExpiry: action.payload,
      };

    default:
      return state;
  }
}

// Auth Context Interface
export interface AuthContextValue extends AuthState {
  // Authentication methods
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  
  // Token management
  refreshToken: () => Promise<void>;
  
  // Profile management
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  checkAuthState: () => Promise<void>;
  
  // Session management
  extendSession: () => void;
  isSessionValid: () => boolean;
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to handle API errors
  const handleApiError = (error: unknown, defaultMessage: string) => {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // Type guard for ApiError-like objects
      const apiError = error as ApiError;
      dispatch({
        type: 'SET_ERROR',
        payload: { error: apiError.message, apiError },
      });
    } else if (error instanceof Error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error.message },
      });
    } else {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: defaultMessage },
      });
    }
  };

  // Check authentication state from stored tokens
  const checkAuthState = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (AUTH_CHECK_MODE === 'skip') {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return;
      }

      const tokens = tokenStorage.getTokens();
      const storedUser = tokenStorage.getUser();

      if (!tokens || !storedUser) {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return;
      }

      if (tokens.accessToken === 'mock-access-token') {
        dispatch({
          type: 'SET_AUTHENTICATION',
          payload: { user: storedUser, tokens },
        });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return;
      }

      if (tokenStorage.isRefreshTokenExpired()) {
        tokenStorage.clearTokens();
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return;
      }

      try {
        const response = await Promise.race([
          apiClient.getMe(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), AUTH_CHECK_TIMEOUT_MS)
          ),
        ]);

        if (response.success && response.data) {
          dispatch({
            type: 'SET_AUTHENTICATION',
            payload: { user: response.data, tokens },
          });
          tokenStorage.setUser(response.data);
        } else {
          tokenStorage.clearTokens();
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Auth check timeout') {
          console.warn('Auth check timed out, continuing without session');
        }
        tokenStorage.clearTokens();
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    } finally {
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  };


  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'SET_LOGIN_LOADING', payload: true });

    try {
      const response = await apiClient.login(credentials);

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Store tokens and user data
        tokenStorage.setTokens(tokens);
        tokenStorage.setUser(user);

        // Update state
        dispatch({
          type: 'SET_AUTHENTICATION',
          payload: { user, tokens },
        });

        // Set session expiry based on access token
        const accessTokenExp = tokenStorage.getTokenExpiration(tokens.accessToken);
        if (accessTokenExp) {
          dispatch({ type: 'SET_SESSION_EXPIRY', payload: accessTokenExp });
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      handleApiError(error, 'Login failed. Please try again.');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOGIN_LOADING', payload: false });
    }
  };

  // Register function
  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'SET_REGISTER_LOADING', payload: true });

    try {
      const response = await apiClient.register(userData);

      if (response.success) {
        // Registration successful, but user might need email verification
        // Don't automatically log in, let the parent component handle the flow
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      handleApiError(error, 'Registration failed. Please try again.');
      throw error;
    } finally {
      dispatch({ type: 'SET_REGISTER_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Check if this is a mock session
      const tokens = tokenStorage.getTokens();
      if (tokens?.accessToken !== 'mock-access-token') {
        // Call logout API to invalidate refresh token (for real sessions)
        await apiClient.logout();
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state and tokens
      tokenStorage.clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    dispatch({ type: 'SET_REFRESH_LOADING', payload: true });

    try {
      const refreshTokenValue = tokenStorage.getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.refresh({ refreshToken: refreshTokenValue });

      if (response.success && response.data) {
        // Update access token
        const currentTokens = tokenStorage.getTokens();
        if (currentTokens) {
          const newTokens = {
            ...currentTokens,
            accessToken: response.data.accessToken,
          };
          tokenStorage.setTokens(newTokens);

          // Set new session expiry
          const accessTokenExp = tokenStorage.getTokenExpiration(newTokens.accessToken);
          if (accessTokenExp) {
            dispatch({ type: 'SET_SESSION_EXPIRY', payload: accessTokenExp });
          }
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      handleApiError(error, 'Session refresh failed. Please log in again.');
      await logout();
      throw error;
    } finally {
      dispatch({ type: 'SET_REFRESH_LOADING', payload: false });
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiClient.updateProfile(data);

      if (response.success && response.data) {
        // Update user in state and storage
        tokenStorage.setUser(response.data);
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      handleApiError(error, 'Profile update failed. Please try again.');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Extend session (update last activity)
  const extendSession = (): void => {
    dispatch({ type: 'UPDATE_LAST_ACTIVITY' });
  };

  // Check if session is still valid
  const isSessionValid = (): boolean => {
    if (!state.isAuthenticated || !state.sessionExpiry) {
      return false;
    }

    const now = new Date();
    return now < state.sessionExpiry;
  };

  // Initialize auth state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  // Set up storage change listener for cross-tab sync
  useEffect(() => {
    const unsubscribe = tokenStorage.onStorageChange((event) => {
      if (event.key === 'auth.access_token' && !event.newValue) {
        // Token was cleared in another tab, logout
        dispatch({ type: 'LOGOUT' });
      }
    });

    return unsubscribe;
  }, []);

  // Context value
  const contextValue: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    checkAuthState,
    extendSession,
    isSessionValid,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
