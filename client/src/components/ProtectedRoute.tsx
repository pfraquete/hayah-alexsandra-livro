import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  /** If true, redirects authenticated users away (for login/register pages) */
  redirectIfAuthenticated?: boolean;
  /** Path to redirect to if not authenticated */
  redirectTo?: string;
  /** Path to redirect to if authenticated (when redirectIfAuthenticated is true) */
  authenticatedRedirectTo?: string;
}

/**
 * ProtectedRoute component that handles route protection based on authentication state.
 *
 * Usage:
 * - Wrap protected pages: <ProtectedRoute><MyProtectedPage /></ProtectedRoute>
 * - For auth pages (login/register): <ProtectedRoute redirectIfAuthenticated><LoginPage /></ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectIfAuthenticated = false,
  redirectTo = '/login',
  authenticatedRedirectTo = '/',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
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

  // Authenticated, show the protected content
  return <>{children}</>;
}
