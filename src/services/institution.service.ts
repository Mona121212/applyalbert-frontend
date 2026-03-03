import http from './http';

/**
 * Backend API response wrapper
 */
interface Result<T> {
  success: boolean;
  data: T;
  requestId?: string;
}

/**
 * Paginated result structure matching PageResult.java
 */
export interface PageResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

/**
 * Institution Request DTO matching InstitutionRequest.java
 * POST (create): all fields required
 * PUT (update): all fields optional
 * Note: status field is used for logical delete (archived)
 */
export interface InstitutionRequest {
  name?: string; // max 255
  website?: string; // max 500
  description?: string; // max 5000
  city?: string; // max 100
  province?: string; // max 100
  country?: string; // max 100
  accreditation?: string; // max 500
  contactEmail?: string; // max 255
  contactPhone?: string; // max 50
  comment?: string; // max 500, optional
  status?: string; // Used for logical delete (archived)
}

/**
 * Institution Response DTO matching InstitutionResponse.java
 */
export interface InstitutionResponse {
  id: string; // UUID as string
  slug: string;
  name: string;
  status: string;
  website: string;
  description: string;
  city: string;
  province: string;
  country: string;
  accreditation: string;
  contactEmail: string;
  contactPhone: string;
  comment?: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Institution Service
 * 
 * Real API calls to backend institution endpoints:
 * - GET /api/admin/institutions (paginated list)
 * - GET /api/admin/institutions/{id} (get by ID)
 * - POST /api/admin/institutions (create, ADMIN only)
 * - PUT /api/admin/institutions/{id} (update)
 * - DELETE /api/admin/institutions/{id} (delete, ADMIN only)
 */
export const institutionService = {
  /**
   * Get paginated list of institutions
   * GET /api/admin/institutions?page=0&size=10
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 10)
   * @returns Paginated list of institutions
   */
  list: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResult<InstitutionResponse>> => {
    const response = await http.get<Result<PageResult<InstitutionResponse>>>(
      '/api/admin/institutions',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch institutions: Invalid response');
    }

    return result.data;
  },

  /**
   * Get institution by ID
   * GET /api/admin/institutions/{id}
   * 
   * @param id - Institution ID (UUID)
   * @returns Institution details
   */
  getById: async (id: string): Promise<InstitutionResponse> => {
    const response = await http.get<Result<InstitutionResponse>>(
      `/api/admin/institutions/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch institution ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new institution
   * POST /api/admin/institutions
   * Requires ADMIN role
   * 
   * @param request - Institution data (all fields required for create)
   * @returns Created institution
   */
  create: async (
    request: InstitutionRequest
  ): Promise<InstitutionResponse> => {
    const response = await http.post<Result<InstitutionResponse>>(
      '/api/admin/institutions',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create institution: Invalid response');
    }

    return result.data;
  },

  /**
   * Update institution
   * PUT /api/admin/institutions/{id}
   * 
   * @param id - Institution ID (UUID)
   * @param request - Institution data (all fields optional for update)
   * @returns Updated institution
   */
  update: async (
    id: string,
    request: InstitutionRequest
  ): Promise<InstitutionResponse> => {
    const response = await http.put<Result<InstitutionResponse>>(
      `/api/admin/institutions/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update institution ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete institution
   * DELETE /api/admin/institutions/{id}
   * Requires ADMIN role
   * 
   * @param id - Institution ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/institutions/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete institution ${id}: Invalid response`);
    }
  },
};
