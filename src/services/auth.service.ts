import http from './http';
import type { LoginRequest, LoginResponse } from '../types/auth';
import { useAuthStore } from '../store/auth.store';

/**
 * Backend API response wrapper
 */
interface Result<T> {
  success: boolean;
  data: T;
  requestId?: string;
}

/**
 * Refresh token request matching RefreshRequest.java
 */
interface RefreshRequest {
  refreshToken: string;
}

/**
 * Logout request matching LogoutRequest.java
 */
interface LogoutRequest {
  refreshToken?: string;
}

/**
 * Authentication service
 * Real API calls to backend authentication endpoints
 */
export const authService = {
  /**
   * Login with email and password
   * POST /api/admin/auth/login
   * 
   * On success:
   * - Stores token in auth store
   * - Parses JWT to extract claims
   * - Stores role and institutionId
   * 
   * @param credentials - Login credentials (email, password, optional totpCode)
   * @returns LoginResponse with token, userId, role, refreshToken
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<Result<LoginResponse>>(
      '/api/admin/auth/login',
      credentials
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Login failed: Invalid response');
    }

    const loginResponse = result.data;

    // Store token, parse JWT, and store role + institutionId
    // This is done automatically by auth.store.setAuth which:
    // 1. Stores accessToken and refreshToken
    // 2. Parses JWT to extract institutionId and other claims
    // 3. Stores role and institutionId
    useAuthStore.getState().setAuth(loginResponse);

    return loginResponse;
  },

  /**
   * Refresh access token using refresh token
   * POST /api/admin/auth/refresh
   * 
   * On success:
   * - Updates tokens in auth store
   * - Parses new JWT to extract claims
   * - Updates role and institutionId
   * 
   * @param refreshToken - Refresh token from previous login
   * @returns LoginResponse with new token, userId, role, refreshToken
   */
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await http.post<Result<LoginResponse>>(
      '/api/admin/auth/refresh',
      { refreshToken } as RefreshRequest
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Refresh failed: Invalid response');
    }

    const loginResponse = result.data;

    // Update tokens, parse JWT, and update role + institutionId
    useAuthStore.getState().setAuth(loginResponse);

    return loginResponse;
  },

  /**
   * Logout and revoke tokens
   * POST /api/admin/auth/logout
   * 
   * On success:
   * - Clears auth store (tokens, role, institutionId, userId)
   * 
   * @param refreshToken - Optional refresh token to revoke
   */
  logout: async (refreshToken?: string): Promise<void> => {
    try {
      const requestBody: LogoutRequest = refreshToken ? { refreshToken } : {};

      await http.post<Result<void>>(
        '/api/admin/auth/logout',
        requestBody
      );
    } catch (error) {
      // Even if logout API call fails, clear local auth state
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear auth store regardless of API call result
      useAuthStore.getState().logout();
    }
  },
};
