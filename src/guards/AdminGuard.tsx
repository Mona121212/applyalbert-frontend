import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import AuthGuard from './AuthGuard';
import ForbiddenPage from '../pages/error/ForbiddenPage';

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Admin Guard Component
 * 
 * Checks:
 * 1. Authentication (via AuthGuard - checks accessToken and expiration)
 * 2. role === SUPER_ADMIN
 * 
 * If not authenticated → redirects to /login
 * If authenticated but not SUPER_ADMIN (e.g., STAFF) → shows 403
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  // First check authentication and token expiration via AuthGuard
  // Then check role
  return (
    <AuthGuard>
      <AdminRoleCheck>{children}</AdminRoleCheck>
    </AuthGuard>
  );
}

/**
 * Internal component to check admin role after authentication is verified
 */
function AdminRoleCheck({ children }: AdminGuardProps) {
  const { role } = useAuthStore();
  const normalizedRole = role?.toUpperCase();
  
  if (normalizedRole !== 'SUPER_ADMIN') {
    // Not an admin - show 403 Forbidden
    // STAFF accessing /admin → 403
    // Unknown role → 403
    return <ForbiddenPage />;
  }

  // User is authenticated and is SUPER_ADMIN, render children
  return <>{children}</>;
}
