import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { parseJwt } from '../utils/token';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Authentication Guard Component
 * 
 * Checks:
 * 1. Whether accessToken exists
 * 2. Whether token is expired (via exp claim)
 * 
 * If token is missing or expired, redirects to /login
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { accessToken } = useAuthStore();

  // Check if accessToken exists
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Check if token is expired
  try {
    const payload = parseJwt(accessToken);
    
    // exp is in seconds, Date.now() is in milliseconds
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        // Token expired, clear auth and redirect
        useAuthStore.getState().logout();
        return <Navigate to="/login" replace />;
      }
    }
  } catch (error) {
    // Failed to parse token, treat as invalid
    console.error('Failed to parse token in AuthGuard:', error);
    useAuthStore.getState().logout();
    return <Navigate to="/login" replace />;
  }

  // Token is valid, render children
  return <>{children}</>;
}
