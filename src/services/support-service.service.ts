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
 * Support Service Request DTO
 * Based on SupportService entity structure
 * POST (create): title required
 * PUT (update): all fields optional
 */
export interface SupportServiceRequest {
  category?: string;
  title?: string; // required for create
  description?: string;
  contact?: string; // JSON
  links?: string; // JSON
  status?: string; // draft | published | archived
}

/**
 * Support Service Response DTO
 * Based on SupportService entity structure
 */
export interface SupportServiceResponse {
  id: string; // UUID as string
  institutionId: string; // UUID as string
  category?: string;
  title: string;
  description?: string;
  contact?: string; // JSON
  links?: string; // JSON
  status: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Support Service Service
 * 
 * Note: If backend API endpoint differs, adjust the paths accordingly
 * Expected endpoints:
 * - GET /api/admin/support-services (paginated list)
 * - GET /api/admin/support-services/{id} (get by ID)
 * - POST /api/admin/support-services (create)
 * - PUT /api/admin/support-services/{id} (update)
 * - DELETE /api/admin/support-services/{id} (delete)
 */
export const supportServiceService = {
  /**
   * Get paginated list of support services
   * GET /api/admin/support-services?page=0&size=20
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20)
   * @returns Paginated list of support services
   */
  list: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResult<SupportServiceResponse>> => {
    const response = await http.get<Result<PageResult<SupportServiceResponse>>>(
      '/api/admin/support-services',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch support services: Invalid response');
    }

    return result.data;
  },

  /**
   * Get support service by ID
   * GET /api/admin/support-services/{id}
   * 
   * @param id - Support Service ID (UUID)
   * @returns Support service details
   */
  getById: async (id: string): Promise<SupportServiceResponse> => {
    const response = await http.get<Result<SupportServiceResponse>>(
      `/api/admin/support-services/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch support service ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new support service
   * POST /api/admin/support-services
   * 
   * @param request - Support service data (title required)
   * @returns Created support service
   */
  create: async (
    request: SupportServiceRequest
  ): Promise<SupportServiceResponse> => {
    const response = await http.post<Result<SupportServiceResponse>>(
      '/api/admin/support-services',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create support service: Invalid response');
    }

    return result.data;
  },

  /**
   * Update support service
   * PUT /api/admin/support-services/{id}
   * 
   * @param id - Support Service ID (UUID)
   * @param request - Support service data (all fields optional)
   * @returns Updated support service
   */
  update: async (
    id: string,
    request: SupportServiceRequest
  ): Promise<SupportServiceResponse> => {
    const response = await http.put<Result<SupportServiceResponse>>(
      `/api/admin/support-services/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update support service ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete support service (logical delete: status = archived)
   * PUT /api/admin/support-services/{id} with status = archived
   * 
   * @param id - Support Service ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    await supportServiceService.update(id, { status: 'archived' });
  },
};
