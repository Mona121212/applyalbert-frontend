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
 * Housing Request DTO matching HousingRequest.java
 * POST (create): title required
 * PUT (update): all fields optional
 */
export interface HousingRequest {
  category?: string; // max 512
  title?: string; // max 512, required for create
  description?: string; // max 4096
  campusId?: string; // UUID as string
  costRange?: string; // max 2048, JSON
  links?: string; // max 2048, JSON
  status?: string; // draft | published | archived
  comment?: string; // max 500, optional
}

/**
 * Housing Response DTO matching HousingResponse.java
 */
export interface HousingResponse {
  id: string; // UUID as string
  institutionId: string; // UUID as string
  campusId?: string; // UUID as string
  category?: string;
  title: string;
  description?: string;
  costRange?: string; // JSON
  links?: string; // JSON
  status: string;
  comment?: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Housing Service
 * 
 * Real API calls to backend housing endpoints:
 * - GET /api/admin/housing (paginated list)
 * - GET /api/admin/housing/{id} (get by ID)
 * - POST /api/admin/housing (create)
 * - PUT /api/admin/housing/{id} (update)
 * - DELETE /api/admin/housing/{id} (delete)
 */
export const housingService = {
  /**
   * Get paginated list of housing options
   * GET /api/admin/housing?page=0&size=20
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20)
   * @returns Paginated list of housing options
   */
  list: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResult<HousingResponse>> => {
    const response = await http.get<Result<PageResult<HousingResponse>>>(
      '/api/admin/housing',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch housing options: Invalid response');
    }

    return result.data;
  },

  /**
   * Get housing option by ID
   * GET /api/admin/housing/{id}
   * 
   * @param id - Housing ID (UUID)
   * @returns Housing details
   */
  getById: async (id: string): Promise<HousingResponse> => {
    const response = await http.get<Result<HousingResponse>>(
      `/api/admin/housing/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch housing ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new housing option
   * POST /api/admin/housing
   * 
   * @param request - Housing data (title required)
   * @returns Created housing
   */
  create: async (
    request: HousingRequest
  ): Promise<HousingResponse> => {
    const response = await http.post<Result<HousingResponse>>(
      '/api/admin/housing',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create housing: Invalid response');
    }

    return result.data;
  },

  /**
   * Update housing option
   * PUT /api/admin/housing/{id}
   * 
   * @param id - Housing ID (UUID)
   * @param request - Housing data (all fields optional)
   * @returns Updated housing
   */
  update: async (
    id: string,
    request: HousingRequest
  ): Promise<HousingResponse> => {
    const response = await http.put<Result<HousingResponse>>(
      `/api/admin/housing/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update housing ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete housing option (logical delete: status = archived)
   * PUT /api/admin/housing/{id} with status = archived
   * 
   * @param id - Housing ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    await housingService.update(id, { status: 'archived' });
  },
};
