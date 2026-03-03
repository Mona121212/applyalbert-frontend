import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse } from '../types/auth';
import { parseJwt } from '../utils/token';

/**
 * Authentication store state
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  institutionId: string | null;
  userId: string | null;
}

/**
 * Authentication store actions
 */
interface AuthActions {
  /**
   * Set authentication data after successful login
   * Parses JWT token to extract institutionId and other claims
   * 
   * @param loginResponse - Login response from backend containing token, userId, role, refreshToken
   */
  setAuth: (loginResponse: LoginResponse) => void;

  /**
   * Clear all authentication data (logout)
   */
  logout: () => void;

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;

/**
 * Initial state
 */
const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  role: null,
  institutionId: null,
  userId: null,
};

/**
 * Authentication store using Zustand with persistence
 * Stores: accessToken, refreshToken, role, institutionId, userId
 * Persists to localStorage for page refresh recovery
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (loginResponse: LoginResponse) => {
        try {
          // Parse JWT token to extract institutionId and verify claims
          const payload = parseJwt(loginResponse.token);

          // Set all authentication data
          set({
            accessToken: loginResponse.token,
            refreshToken: loginResponse.refreshToken || null,
            role: loginResponse.role || payload.role,
            institutionId: payload.institutionId || null,
            userId: loginResponse.userId || payload.sub,
          });
        } catch (error) {
          console.error('Failed to parse JWT token during login:', error);
          // Still set basic auth data even if parsing fails
          set({
            accessToken: loginResponse.token,
            refreshToken: loginResponse.refreshToken || null,
            role: loginResponse.role,
            institutionId: null,
            userId: loginResponse.userId,
          });
        }
      },

      logout: () => {
        set(initialState);
      },

      isAuthenticated: () => {
        const state = get();
        return state.accessToken !== null && state.userId !== null;
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist sensitive tokens and user info
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        institutionId: state.institutionId,
        userId: state.userId,
      }),
    }
  )
);
