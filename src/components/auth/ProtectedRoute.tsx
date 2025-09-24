/**
 * ProtectedRoute Component
 * Route protection with role-based access control and loading states
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

// Loading component for route protection checks
const RouteProtectionLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Verifying access...</p>
    </div>
  </div>
);

// Unauthorized access component
const UnauthorizedAccess: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'You do not have permission to access this page.', onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

// Email verification required component
const EmailVerificationRequired: React.FC<{
  onResendEmail?: () => void;
}> = ({ onResendEmail }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
        <svg
          className="h-8 w-8 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h2>
      <p className="text-gray-600 mb-6">
        Please verify your email address to access this page. Check your inbox for a verification link.
      </p>
      {onResendEmail && (
        <button
          onClick={onResendEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Resend Verification Email
        </button>
      )}
    </div>
  </div>
);

// Main ProtectedRoute component props
export interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Required roles to access the route
   */
  roles?: UserRole[] | UserRole;
  /**
   * Whether email verification is required
   */
  requireEmailVerification?: boolean;
  /**
   * Custom redirect path for unauthenticated users
   */
  redirectTo?: string;
  /**
   * Custom redirect path for unauthorized users
   */
  unauthorizedRedirect?: string;
  /**
   * Custom loading component
   */
  loadingComponent?: React.ComponentType;
  /**
   * Custom unauthorized component
   */
  unauthorizedComponent?: React.ComponentType<{
    message?: string;
    onRetry?: () => void;
  }>;
  /**
   * Custom email verification component
   */
  emailVerificationComponent?: React.ComponentType<{
    onResendEmail?: () => void;
  }>;
  /**
   * Whether to show the default unauthorized message
   */
  fallback?: React.ComponentType | ReactNode;
  /**
   * Custom permission check function
   */
  hasPermission?: (user: any) => boolean;
}

/**
 * ProtectedRoute component for route-level authentication and authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  requireEmailVerification = false,
  redirectTo = '/auth/login',
  unauthorizedRedirect,
  loadingComponent: CustomLoadingComponent,
  unauthorizedComponent: CustomUnauthorizedComponent,
  emailVerificationComponent: CustomEmailVerificationComponent,
  hasPermission,
}) => {
  const router = useRouter();
  const auth = useAuth();

  // Handle authentication redirect
  useEffect(() => {
    if (auth.isInitialized && !auth.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [auth.isInitialized, auth.isAuthenticated, redirectTo, router]);

  // Handle unauthorized redirect
  useEffect(() => {
    if (
      auth.isInitialized && 
      auth.isAuthenticated && 
      auth.user && 
      unauthorizedRedirect
    ) {
      const hasRequiredRole = roles ? auth.hasRole(roles) : true;
      const hasCustomPermission = hasPermission ? hasPermission(auth.user) : true;
      
      if (!hasRequiredRole || !hasCustomPermission) {
        router.push(unauthorizedRedirect);
      }
    }
  }, [
    auth.isInitialized,
    auth.isAuthenticated,
    auth.user,
    auth.hasRole,
    roles,
    hasPermission,
    unauthorizedRedirect,
    router,
    auth,
  ]);

  // Show loading while checking authentication
  if (!auth.isInitialized || auth.isLoading) {
    const LoadingComponent = CustomLoadingComponent || RouteProtectionLoading;
    return <LoadingComponent />;
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }

  // Check email verification requirement
  if (requireEmailVerification && !auth.isEmailVerified()) {
    const EmailVerificationComponent = 
      CustomEmailVerificationComponent || EmailVerificationRequired;
    
    const handleResendEmail = async () => {
      try {
        // Implement resend email functionality
        console.log('Resending verification email...');
        // You might want to add this method to your API client
        // await apiClient.resendVerificationEmail();
      } catch (error) {
        console.error('Failed to resend verification email:', error);
      }
    };

    return <EmailVerificationComponent onResendEmail={handleResendEmail} />;
  }

  // Check role-based access
  if (roles && !auth.hasRole(roles)) {
    if (unauthorizedRedirect) {
      return null; // Redirect is handled in useEffect
    }

    const UnauthorizedComponent = CustomUnauthorizedComponent || UnauthorizedAccess;
    const roleNames = Array.isArray(roles) ? roles.join(', ') : roles;
    
    return (
      <UnauthorizedComponent
        message={`This page requires ${roleNames} access.`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Check custom permission
  if (hasPermission && auth.user && !hasPermission(auth.user)) {
    if (unauthorizedRedirect) {
      return null; // Redirect is handled in useEffect
    }

    const UnauthorizedComponent = CustomUnauthorizedComponent || UnauthorizedAccess;
    
    return (
      <UnauthorizedComponent
        message="You do not have permission to access this resource."
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Check if user account is active
  if (auth.user && auth.user.status !== 'ACTIVE') {
    const UnauthorizedComponent = CustomUnauthorizedComponent || UnauthorizedAccess;
    
    let message = 'Your account is not active.';
    if (auth.user.status === 'SUSPENDED') {
      message = 'Your account has been suspended. Please contact support.';
    } else if (auth.user.status === 'BANNED') {
      message = 'Your account has been banned. Please contact support.';
    } else if (auth.user.status === 'INACTIVE') {
      message = 'Your account is inactive. Please contact support to activate.';
    }
    
    return <UnauthorizedComponent message={message} />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Convenience components for common use cases

/**
 * AdminRoute - Requires ADMIN role
 */
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'roles'>> = (props) => (
  <ProtectedRoute {...props} roles={UserRole.ADMIN} />
);

/**
 * ModeratorRoute - Requires MODERATOR or ADMIN role
 */
export const ModeratorRoute: React.FC<Omit<ProtectedRouteProps, 'roles'>> = (props) => (
  <ProtectedRoute {...props} roles={[UserRole.ADMIN, UserRole.MODERATOR]} />
);

/**
 * DeveloperRoute - Requires ADMIN role (developer access)
 */
export const DeveloperRoute: React.FC<Omit<ProtectedRouteProps, 'roles'>> = (props) => (
  <ProtectedRoute {...props} roles={UserRole.ADMIN} />
);

/**
 * VerifiedRoute - Requires email verification
 */
export const VerifiedRoute: React.FC<Omit<ProtectedRouteProps, 'requireEmailVerification'>> = (props) => (
  <ProtectedRoute {...props} requireEmailVerification={true} />
);

// HOC for component-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  protectionOptions?: Omit<ProtectedRouteProps, 'children'>
) {
  const ProtectedComponent = (props: P) => (
    <ProtectedRoute {...protectionOptions}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}

export default ProtectedRoute;