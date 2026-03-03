import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import AuthGuard from './AuthGuard';
import ForbiddenPage from '../pages/error/ForbiddenPage';

interface StaffGuardProps {
  children: ReactNode;
}

/**
 * Staff Guard Component
 * 
 * Checks:
 * 1. Authentication (via AuthGuard - checks accessToken and expiration)
 * 2. role === STAFF
 * 
 * If not authenticated → redirects to /login
 * If authenticated but not STAFF (e.g., SUPER_ADMIN) → shows 403
 */
export default function StaffGuard({ children }: StaffGuardProps) {
  // First check authentication and token expiration via AuthGuard
  // Then check role
  return (
    <AuthGuard>
      <StaffRoleCheck>{children}</StaffRoleCheck>
    </AuthGuard>
  );
}

/**
 * Internal component to check staff role after authentication is verified
 */
function StaffRoleCheck({ children }: StaffGuardProps) {
  const { role } = useAuthStore();
  const normalizedRole = role?.toUpperCase();
  
  if (normalizedRole !== 'STAFF') {
    // Not staff - show 403 Forbidden
    // SUPER_ADMIN accessing /staff → 403
    // Unknown role → 403
    return <ForbiddenPage />;
  }

  // User is authenticated and is STAFF, render children
  return <>{children}</>;
}
