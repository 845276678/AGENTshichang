/**
 * Authentication System Usage Examples
 * Complete examples showing how to use the authentication system
 */

import React from 'react';
import { useAuth, useRequireAuth, useRequireRole } from '@/hooks/useAuth';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute, AdminRoute, VerifiedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/auth';

// Example 1: Basic App Setup with AuthProvider
export function AppWithAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      // Optional custom loading component
      loadingComponent={() => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading application...</p>
          </div>
        </div>
      )}
      // Enable session warnings
      showSessionWarning={true}
    >
      {children}
    </AuthProvider>
  );
}

// Example 2: Login Page Component
export function LoginPage() {
  const auth = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Login with redirect to dashboard
      await auth.loginWithRedirect({ email, password }, '/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Error is handled by auth context, display auth.error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {auth.error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {auth.error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div className="mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={auth.isLoggingIn}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {auth.isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

// Example 3: Protected Dashboard Component
export function DashboardPage() {
  const auth = useRequireAuth(); // Automatically redirects if not authenticated
  
  const handleLogout = async () => {
    await auth.logoutWithRedirect('/');
  };

  if (!auth.isInitialized || !auth.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {auth.user.username}!</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Profile Status</h2>
            <p>Email: {auth.user.email}</p>
            <p>Role: {auth.user.role}</p>
            <p>Verified: {auth.isEmailVerified() ? '✅' : '❌'}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Permissions</h2>
            <ul>
              <li>Admin: {auth.hasRole(UserRole.ADMIN) ? '✅' : '❌'}</li>
              <li>Moderator: {auth.hasRole([UserRole.ADMIN, UserRole.MODERATOR]) ? '✅' : '❌'}</li>
              <li>Developer: {auth.hasRole(UserRole.DEVELOPER) ? '✅' : '❌'}</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Session Info</h2>
            <p>Session Valid: {auth.isSessionValid() ? '✅' : '❌'}</p>
            <p>Last Activity: {auth.lastActivity?.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: Admin-Only Page with Role Protection
export function AdminPage() {
  const auth = useRequireRole(UserRole.ADMIN, '/unauthorized');
  
  if (!auth.user) {return null;}

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>This is an admin-only page. Only users with ADMIN role can see this.</p>
          <p>Current user role: {auth.user.role}</p>
        </div>
      </div>
    </div>
  );
}

// Example 5: Profile Update Component
export function ProfileUpdateForm() {
  const auth = useAuth();
  const [username, setUsername] = React.useState(auth.user?.username || '');
  const [bio, setBio] = React.useState(auth.user?.bio || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await auth.updateProfile({ username, bio });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md h-24"
        />
      </div>
      
      <button
        type="submit"
        disabled={auth.isLoading}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {auth.isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}

// Example 6: Using ProtectedRoute Components
export function AppRoutes() {
  return (
    <div>
      {/* Public route */}
      <HomePage />
      
      {/* Basic protected route */}
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
      
      {/* Admin-only route */}
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
      
      {/* Email verification required */}
      <VerifiedRoute>
        <SensitiveDataPage />
      </VerifiedRoute>
      
      {/* Custom role requirement */}
      <ProtectedRoute 
        roles={[UserRole.ADMIN, UserRole.MODERATOR]}
        requireEmailVerification={true}
      >
        <ModerationPanel />
      </ProtectedRoute>
      
      {/* Custom permission check */}
      <ProtectedRoute 
        hasPermission={(user) => user.role === 'DEVELOPER' && user.isEmailVerified}
        unauthorizedRedirect="/developer-access-denied"
      >
        <DeveloperTools />
      </ProtectedRoute>
    </div>
  );
}

// Example 7: HOC Usage
export const ProtectedDashboard = withAuth(DashboardPage, {
  roles: UserRole.USER,
  requireEmailVerification: true
});

// Example 8: Session Management
export function SessionManager() {
  const auth = useAuth();

  React.useEffect(() => {
    // Listen for session warning events
    const handleSessionWarning = (event: CustomEvent) => {
      console.log('Session expiring in:', event.detail.expiresIn, 'ms');
      // Show custom notification or modal
    };

    window.addEventListener('auth:session-warning' as any, handleSessionWarning);
    
    return () => {
      window.removeEventListener('auth:session-warning' as any, handleSessionWarning);
    };
  }, []);

  const extendSession = async () => {
    try {
      await auth.refreshToken();
      alert('Session extended!');
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Session Management</h3>
      <div className="space-y-2">
        <p>Session Valid: {auth.isSessionValid() ? 'Yes' : 'No'}</p>
        <p>Session Expiry: {auth.sessionExpiry?.toLocaleString()}</p>
        <button
          onClick={extendSession}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Extend Session
        </button>
      </div>
    </div>
  );
}

// Placeholder components
function HomePage() { return <div>Home Page</div>; }
function SensitiveDataPage() { return <div>Sensitive Data Page</div>; }
function ModerationPanel() { return <div>Moderation Panel</div>; }
function DeveloperTools() { return <div>Developer Tools</div>; }
function withAuth(Component: any, options: any) {
  const WrappedComponent = (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}