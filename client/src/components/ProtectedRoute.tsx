import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
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
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (redirectIfAuthenticated && isAuthenticated) {
      // User is authenticated but shouldn't be on this page (e.g., login page)
      setLocation(authenticatedRedirectTo);
    } else if (!redirectIfAuthenticated && !isAuthenticated) {
      // User is not authenticated but should be
      setLocation(redirectTo);
    }
  }, [isAuthenticated, loading, redirectIfAuthenticated, redirectTo, authenticatedRedirectTo, setLocation]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of content while redirecting
  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  if (!redirectIfAuthenticated && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC version for wrapping route components
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
