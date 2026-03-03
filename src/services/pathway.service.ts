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
 * Pathway Request DTO matching PathwayRequest.java
 * POST (create): name required
 * PUT (update): all fields optional
 */
export interface PathwayRequest {
  name?: string; // max 255, required for create
  description?: string; // max 4096
  status?: string; // draft | published | archived
  comment?: string; // max 500, optional
}

/**
 * Pathway Response DTO matching PathwayResponse.java
 */
export interface PathwayResponse {
  id: string; // UUID as string
  name: string;
  description?: string;
  status: string;
  institutionId: string; // UUID as string
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  comment?: string;
}

/**
 * Pathway Service
 * 
 * Real API calls to backend pathway endpoints:
 * - GET /api/admin/pathways (paginated list)
 * - GET /api/admin/pathways/{id} (get by ID)
 * - POST /api/admin/pathways (create)
 * - PUT /api/admin/pathways/{id} (update)
 * - DELETE /api/admin/pathways/{id} (delete)
 */
export const pathwayService = {
  /**
   * Get paginated list of pathways
   * GET /api/admin/pathways?page=0&size=20
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20)
   * @returns Paginated list of pathways
   */
  list: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResult<PathwayResponse>> => {
    const response = await http.get<Result<PageResult<PathwayResponse>>>(
      '/api/admin/pathways',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch pathways: Invalid response');
    }

    return result.data;
  },

  /**
   * Get pathway by ID
   * GET /api/admin/pathways/{id}
   * 
   * @param id - Pathway ID (UUID)
   * @returns Pathway details
   */
  getById: async (id: string): Promise<PathwayResponse> => {
    const response = await http.get<Result<PathwayResponse>>(
      `/api/admin/pathways/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch pathway ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new pathway
   * POST /api/admin/pathways
   * 
   * @param request - Pathway data (name required)
   * @returns Created pathway
   */
  create: async (
    request: PathwayRequest
  ): Promise<PathwayResponse> => {
    const response = await http.post<Result<PathwayResponse>>(
      '/api/admin/pathways',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create pathway: Invalid response');
    }

    return result.data;
  },

  /**
   * Update pathway
   * PUT /api/admin/pathways/{id}
   * 
   * @param id - Pathway ID (UUID)
   * @param request - Pathway data (all fields optional)
   * @returns Updated pathway
   */
  update: async (
    id: string,
    request: PathwayRequest
  ): Promise<PathwayResponse> => {
    const response = await http.put<Result<PathwayResponse>>(
      `/api/admin/pathways/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update pathway ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete pathway (logical delete: status = archived)
   * PUT /api/admin/pathways/{id} with status = archived
   * 
   * @param id - Pathway ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    await pathwayService.update(id, { status: 'archived' });
  },
};
