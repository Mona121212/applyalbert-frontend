import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { LoginResponse } from '../types/auth';
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
 * Backend error response
 */
interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  requestId?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Refresh token request
 */
interface RefreshRequest {
  refreshToken: string;
}

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
// Queue of failed requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      prom.reject(new Error('Token refresh failed: No token received'));
    }
  });
  failedQueue = [];
};

/**
 * Create Axios instance with interceptors
 * This is the core HTTP client for the entire system
 */
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Automatically inject Authorization header with Bearer token
 */
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    const token = authStore.accessToken;

    // Skip adding token for refresh endpoint to avoid infinite loop
    if (token && !config.url?.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 errors with automatic token refresh
 * - 401 → Call /admin/auth/refresh
 * - Refresh success → Retry original request with new token
 * - Refresh failure → Clear store → Redirect to /login
 */
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for refresh endpoint itself to prevent infinite loop
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authStore = useAuthStore.getState();
      const refreshToken = authStore.refreshToken;

      // No refresh token available, logout immediately
      if (!refreshToken) {
        isRefreshing = false;
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const refreshResponse = await axios.post<Result<LoginResponse>>(
          `${http.defaults.baseURL}/api/admin/auth/refresh`,
          { refreshToken } as RefreshRequest
        );

        const refreshData = refreshResponse.data;

        // Check if refresh was successful
        if (refreshData.success && refreshData.data) {
          const loginResponse = refreshData.data;

          // Update auth store with new tokens
          authStore.setAuth(loginResponse);

          // Process queued requests
          processQueue(null, loginResponse.token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${loginResponse.token}`;
          }
          return http(originalRequest);
        } else {
          throw new Error('Refresh failed: Invalid response');
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        isRefreshing = false;
        processQueue(refreshError as Error, null);
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, reject normally
    return Promise.reject(error);
  }
);

export default http;
