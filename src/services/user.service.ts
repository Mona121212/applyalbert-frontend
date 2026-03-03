import http from './http';
import type { PageResult } from './institution.service';

/**
 * Backend API response wrapper
 */
interface Result<T> {
  success: boolean;
  data: T;
  requestId?: string;
}

/**
 * Create Staff Request DTO matching CreateStaffRequest.java
 */
export interface CreateStaffRequest {
  email: string; // required, max 255, email format
  password: string; // required, min 6, max 128
  displayName?: string; // max 255
  role?: string; // staff | admin, default staff
  institutionId: string; // required when role=staff, UUID as string
}

/**
 * Update Staff Request DTO matching UpdateStaffRequest.java
 */
export interface UpdateStaffRequest {
  displayName?: string; // max 255
  newPassword?: string; // min 6, max 128
  isActive?: boolean; // for logical delete (isActive = false)
}

/**
 * Staff User Response DTO matching StaffUserResponse.java
 */
export interface StaffUserResponse {
  id: string; // UUID as string
  email: string;
  displayName?: string;
  role: string; // STAFF | ADMIN
  institutionId?: string; // UUID as string
  isActive: boolean;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * User Service
 * 
 * Real API calls to backend user endpoints:
 * - GET /api/admin/users (paginated list)
 * - GET /api/admin/users/{id} (get by ID)
 * - POST /api/admin/users (create staff)
 * - PUT /api/admin/users/{id} (update staff)
 * - DELETE /api/admin/users/{id} (delete)
 */
export const userService = {
  /**
   * Get paginated list of users
   * GET /api/admin/users?page=0&size=20&institutionId=xxx&role=xxx
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20)
   * @param institutionId - Optional filter by institution
   * @param role - Optional filter by role
   * @returns Paginated list of users
   */
  list: async (
    page: number = 0,
    size: number = 20,
    institutionId?: string,
    role?: string
  ): Promise<PageResult<StaffUserResponse>> => {
    const params: Record<string, any> = {
      page,
      size,
    };
    if (institutionId) params.institutionId = institutionId;
    if (role) params.role = role;

    const response = await http.get<Result<PageResult<StaffUserResponse>>>(
      '/api/admin/users',
      { params }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch users: Invalid response');
    }

    return result.data;
  },

  /**
   * Get user by ID
   * GET /api/admin/users/{id}
   * 
   * @param id - User ID (UUID)
   * @returns User details
   */
  getById: async (id: string): Promise<StaffUserResponse> => {
    const response = await http.get<Result<StaffUserResponse>>(
      `/api/admin/users/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch user ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new staff user
   * POST /api/admin/users
   * Requires ADMIN role
   * 
   * @param request - Staff user data
   * @returns Created user
   */
  create: async (
    request: CreateStaffRequest
  ): Promise<StaffUserResponse> => {
    const response = await http.post<Result<StaffUserResponse>>(
      '/api/admin/users',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create user: Invalid response');
    }

    return result.data;
  },

  /**
   * Update staff user
   * PUT /api/admin/users/{id}
   * 
   * @param id - User ID (UUID)
   * @param request - User data
   * @returns Updated user
   */
  update: async (
    id: string,
    request: UpdateStaffRequest
  ): Promise<StaffUserResponse> => {
    const response = await http.put<Result<StaffUserResponse>>(
      `/api/admin/users/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update user ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete user
   * DELETE /api/admin/users/{id}
   * Requires ADMIN role
   * 
   * @param id - User ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/users/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete user ${id}: Invalid response`);
    }
  },
};
