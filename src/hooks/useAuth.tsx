/**
 * useAuth Hook
 * Custom React hook for authentication state management
 * Provides access to auth context and additional helper functions
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthContext, AuthContextValue } from '@/contexts/AuthContext';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { tokenStorage } from '@/lib/token-storage';

// Extended auth hook interface
export interface UseAuthReturn extends AuthContextValue {
  // Helper methods
  loginWithRedirect: (credentials: LoginRequest, redirectTo?: string) => Promise<void>;
  registerWithRedirect: (userData: RegisterRequest, redirectTo?: string) => Promise<void>;
  logoutWithRedirect: (redirectTo?: string) => Promise<void>;
  
  // Route protection
  requireAuth: (redirectTo?: string) => boolean;
  requireGuest: (redirectTo?: string) => boolean;
  
  // Session management
  autoRefreshToken: () => void;
  stopAutoRefresh: () => void;
  
  // Utility methods
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isEmailVerified: () => boolean;
  
  // Activity tracking
  trackActivity: () => void;
}

// Auto-refresh configuration
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Enhanced useAuth hook with additional functionality
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const authContext = useAuthContext();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  // Login with optional redirect
  const loginWithRedirect = useCallback(async (
    credentials: LoginRequest,
    redirectTo: string = '/'
  ): Promise<void> => {
    await authContext.login(credentials);
    router.push(redirectTo);
  }, [authContext, router]);

  // Register with optional redirect
  const registerWithRedirect = useCallback(async (
    userData: RegisterRequest,
    redirectTo: string = '/'
  ): Promise<void> => {
    await authContext.register(userData);
    router.push(redirectTo);
  }, [authContext, router]);

  // Logout with optional redirect
  const logoutWithRedirect = useCallback(async (
    redirectTo: string = '/auth/login'
  ): Promise<void> => {
    await authContext.logout();
    router.push(redirectTo);
  }, [authContext, router]);

  // Require authentication (redirect if not authenticated)
  const requireAuth = useCallback((redirectTo: string = '/auth/login'): boolean => {
    if (!authContext.isInitialized) {
      return false; // Still loading
    }

    if (!authContext.isAuthenticated) {
      router.push(redirectTo);
      return false;
    }

    return true;
  }, [authContext.isAuthenticated, authContext.isInitialized, router]);

  // Require guest (redirect if authenticated)
  const requireGuest = useCallback((redirectTo: string = '/'): boolean => {
    if (!authContext.isInitialized) {
      return false; // Still loading
    }

    if (authContext.isAuthenticated) {
      router.push(redirectTo);
      return false;
    }

    return true;
  }, [authContext.isAuthenticated, authContext.isInitialized, router]);

  // Check if user has specific role(s)
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!authContext.user) {return false;}

    const userRole = authContext.user.role;
    if (typeof role === 'string') {
      return userRole === role;
    }

    return role.includes(userRole);
  }, [authContext.user]);

  // Check if user has specific permission (extend based on your permission system)
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authContext.user) {return false;}

    // Example permission logic - customize based on your needs
    const { role } = authContext.user;
    
    switch (permission) {
      case 'admin':
        return role === 'ADMIN';
      case 'moderator':
        return ['ADMIN', 'MODERATOR'].includes(role);
      case 'developer':
        return ['ADMIN', 'DEVELOPER'].includes(role);
      default:
        return true; // Default permission for authenticated users
    }
  }, [authContext.user]);

  // Check if email is verified
  const isEmailVerified = useCallback((): boolean => {
    return authContext.user?.isEmailVerified ?? false;
  }, [authContext.user]);

  // Track user activity
  const trackActivity = useCallback((): void => {
    if (authContext.isAuthenticated) {
      authContext.extendSession();
    }
  }, [authContext]);

  // Auto-refresh token
  const autoRefreshToken = useCallback((): void => {
    if (!authContext.isAuthenticated) {return;}

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(async () => {
      try {
        // Check if token needs refresh
        if (tokenStorage.isAccessTokenExpired() && !tokenStorage.isRefreshTokenExpired()) {
          await authContext.refreshToken();
        }

        // Check session expiry and show warning
        if (authContext.sessionExpiry && !warningShownRef.current) {
          const now = new Date();
          const timeToExpiry = authContext.sessionExpiry.getTime() - now.getTime();
          
          if (timeToExpiry <= SESSION_WARNING_TIME && timeToExpiry > 0) {
            warningShownRef.current = true;
            // You can dispatch a custom event or show a notification here
            window.dispatchEvent(new CustomEvent('auth:session-warning', {
              detail: { expiresIn: timeToExpiry }
            }));
          }
        }
      } catch (error) {
        console.error('Auto token refresh failed:', error);
        // Token refresh failed, user will be logged out by the context
      }
    }, AUTO_REFRESH_INTERVAL);
  }, [authContext]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback((): void => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = undefined;
    }
    warningShownRef.current = false;
  }, []);

  // Start auto-refresh when authenticated
  useEffect(() => {
    if (authContext.isAuthenticated) {
      autoRefreshToken();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [authContext.isAuthenticated, autoRefreshToken, stopAutoRefresh]);

  // Track activity on user interactions
  useEffect(() => {
    if (!authContext.isAuthenticated) {return;}

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      // Debounce activity tracking
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        trackActivity();
      }, 1000);
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearTimeout(activityTimeout);
    };
  }, [authContext.isAuthenticated, trackActivity]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth.access_token' && !event.newValue) {
        // Token was removed in another tab
        stopAutoRefresh();
      } else if (event.key === 'auth.access_token' && event.newValue) {
        // Token was updated in another tab
        if (authContext.isAuthenticated) {
          autoRefreshToken();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [authContext.isAuthenticated, autoRefreshToken, stopAutoRefresh]);

  return {
    ...authContext,
    loginWithRedirect,
    registerWithRedirect,
    logoutWithRedirect,
    requireAuth,
    requireGuest,
    autoRefreshToken,
    stopAutoRefresh,
    hasRole,
    hasPermission,
    isEmailVerified,
    trackActivity,
  };
}

// Hook for route protection
export function useRequireAuth(redirectTo: string = '/auth/login'): UseAuthReturn {
  const auth = useAuth();
  
  useEffect(() => {
    auth.requireAuth(redirectTo);
  }, [auth, redirectTo]);

  return auth;
}

// Hook for guest-only routes
export function useRequireGuest(redirectTo: string = '/dashboard'): UseAuthReturn {
  const auth = useAuth();
  
  useEffect(() => {
    auth.requireGuest(redirectTo);
  }, [auth, redirectTo]);

  return auth;
}

// Hook for role-based access
export function useRequireRole(
  role: string | string[], 
  redirectTo: string = '/unauthorized'
): UseAuthReturn {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (auth.isInitialized && auth.isAuthenticated && !auth.hasRole(role)) {
      router.push(redirectTo);
    }
  }, [auth, role, redirectTo, router]);

  return auth;
}

export default useAuth;