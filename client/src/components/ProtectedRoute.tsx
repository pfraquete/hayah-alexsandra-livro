import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, redirects authenticated users away (for login/register pages) */
  redirectIfAuthenticated?: boolean;
  /** Path to redirect to if not authenticated */
  redirectTo?: string;
  /** Path to redirect to if authenticated (when redirectIfAuthenticated is true) */
  authenticatedRedirectTo?: string;
  /** Roles allowed to access this route. If undefined, all authenticated users are allowed. */
  allowedRoles?: ('user' | 'admin')[];
}

/**
 * ProtectedRoute component that handles route protection based on authentication state.
 *
 * Usage:
 * - Wrap protected pages: <ProtectedRoute><MyProtectedPage /></ProtectedRoute>
 * - For auth pages (login/register): <ProtectedRoute redirectIfAuthenticated><LoginPage /></ProtectedRoute>
 * - For admin pages: <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectIfAuthenticated = false,
  redirectTo = '/login',
  authenticatedRedirectTo = '/',
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Create query object but control enablement
  // We use trpc.auth.me to get the user role from the database
  const userQuery = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated && !loading && !redirectIfAuthenticated && !!allowedRoles,
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Show loading state while checking authentication or role
  if (loading || (isAuthenticated && !!allowedRoles && userQuery.isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // For auth pages (login, register): redirect TO home if already authenticated
  if (redirectIfAuthenticated) {
    if (isAuthenticated) {
      return <Redirect to={authenticatedRedirectTo} />;
    }
    // Not authenticated, show the auth page (login/register)
    return <>{children}</>;
  }

  // For protected pages: redirect TO login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Role based access control
  if (allowedRoles && userQuery.data) {
    if (!allowedRoles.includes(userQuery.data.role)) {
      // User does not have permission
      return <Redirect to="/" />; // Redirect to home or specialized unauthorized page
    }
  } else if (allowedRoles && userQuery.error) {
    // If we failed to fetch user data (e.g. auth error), redirect to login
    console.error("Failed to fetch user profile for RBAC:", userQuery.error);
    return <Redirect to={redirectTo} />;
  } else if (allowedRoles && !userQuery.data && !userQuery.isLoading) {
    // Should ideally not happen if isAuthenticated is true, but just in case
    // Maybe the DB user wasn't created yet?
    return <Redirect to={redirectTo} />;
  }

  // Authenticated and authorized, show the protected content
  return <>{children}</>;
}
