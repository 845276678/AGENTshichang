/**
 * AuthProvider Component
 * Root authentication provider with session management and loading states
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { AuthProvider as AuthContextProvider, useAuth } from '@/contexts/AuthContext';

// Loading component for initial auth check
const AuthLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">正在初始化身份验证...</p>
    </div>
  </div>
);

// Session warning modal component
const SessionWarningModal: React.FC<{
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  expiresIn: number;
}> = ({ isOpen, onExtend, onLogout, expiresIn }) => {
  const minutes = Math.ceil(expiresIn / 60000);

  if (!isOpen) {return null;}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Expiring Soon
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your session will expire in {minutes} minute{minutes !== 1 ? 's' : ''}. 
            Would you like to extend your session?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onExtend}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed unused AuthProviderWrapper component for TypeScript compliance

// Root AuthProvider component
export interface AuthProviderProps {
  children: ReactNode;
  /**
   * Custom loading component to show during auth initialization
   */
  loadingComponent?: React.ComponentType;
  /**
   * Whether to show session warning modal
   */
  showSessionWarning?: boolean;
  /**
   * Custom session warning component
   */
  sessionWarningComponent?: React.ComponentType<{
    isOpen: boolean;
    onExtend: () => void;
    onLogout: () => void;
    expiresIn: number;
  }>;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  loadingComponent: CustomLoadingComponent,
  showSessionWarning = true,
  sessionWarningComponent: CustomSessionWarningComponent,
}) => {
  return (
    <AuthContextProvider>
      <AuthProviderInner
        loadingComponent={CustomLoadingComponent || undefined}
        showSessionWarning={showSessionWarning}
        sessionWarningComponent={CustomSessionWarningComponent || undefined}
      >
        {children}
      </AuthProviderInner>
    </AuthContextProvider>
  );
};

// Inner provider component to access auth context
interface AuthProviderInnerProps {
  children: ReactNode;
  loadingComponent?: React.ComponentType | undefined;
  showSessionWarning: boolean;
  sessionWarningComponent?: React.ComponentType<{
    isOpen: boolean;
    onExtend: () => void;
    onLogout: () => void;
    expiresIn: number;
  }> | undefined;
}

const AuthProviderInner: React.FC<AuthProviderInnerProps> = ({
  children,
  loadingComponent: CustomLoadingComponent,
  showSessionWarning,
  sessionWarningComponent: CustomSessionWarningComponent,
}) => {
  const auth = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [expiresIn, setExpiresIn] = useState(0);

  // Handle session warning events
  useEffect(() => {
    if (!showSessionWarning) {return;}

    const handleSessionWarning = (event: CustomEvent) => {
      setExpiresIn(event.detail.expiresIn);
      setShowWarning(true);
    };

    window.addEventListener('auth:session-warning' as any, handleSessionWarning);

    return () => {
      window.removeEventListener('auth:session-warning' as any, handleSessionWarning);
    };
  }, [showSessionWarning]);

  // Auto-hide warning after session is extended
  useEffect(() => {
    if (showWarning && auth.isSessionValid()) {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [auth.isSessionValid, showWarning, auth]);

  // Handle session extension
  const handleExtendSession = async () => {
    try {
      await auth.refreshToken();
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      await auth.logout();
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setShowWarning(false);
    await auth.logout();
  };

  // Show loading component while initializing
  if (!auth.isInitialized) {
    const LoadingComponent = CustomLoadingComponent || AuthLoading;
    return <LoadingComponent />;
  }

  // Render session warning component
  const SessionWarningComponent = CustomSessionWarningComponent || SessionWarningModal;

  return (
    <>
      {children}
      {showSessionWarning && (
        <SessionWarningComponent
          isOpen={showWarning}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
          expiresIn={expiresIn}
        />
      )}
    </>
  );
};

// Export convenience hook for accessing auth within the provider
export { useAuth } from '@/contexts/AuthContext';

export default AuthProvider;