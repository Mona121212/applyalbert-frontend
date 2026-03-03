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
 * Scholarship Request DTO matching ScholarshipRequest.java
 * POST (create): name required
 * PUT (update): all fields optional
 */
export interface ScholarshipRequest {
  name?: string; // max 512, required for create
  description?: string; // max 4096
  amount?: number; // BigDecimal
  deadline?: string; // LocalDate (YYYY-MM-DD)
  eligibility?: string; // max 2048
  status?: string; // draft | published | archived
  comment?: string; // max 500, optional
}

/**
 * Scholarship Response DTO matching ScholarshipResponse.java
 */
export interface ScholarshipResponse {
  id: string; // UUID as string
  institutionId: string; // UUID as string
  name: string;
  description?: string;
  eligibility?: string;
  amount?: number;
  deadline?: string; // LocalDate (YYYY-MM-DD)
  status: string;
  comment?: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Scholarship Service
 * 
 * Real API calls to backend scholarship endpoints:
 * - GET /api/admin/scholarships (paginated list)
 * - GET /api/admin/scholarships/{id} (get by ID)
 * - POST /api/admin/scholarships (create)
 * - PUT /api/admin/scholarships/{id} (update)
 * - DELETE /api/admin/scholarships/{id} (delete)
 */
export const scholarshipService = {
  /**
   * Get paginated list of scholarships
   * GET /api/admin/scholarships?page=0&size=20
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 20)
   * @returns Paginated list of scholarships
   */
  list: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResult<ScholarshipResponse>> => {
    const response = await http.get<Result<PageResult<ScholarshipResponse>>>(
      '/api/admin/scholarships',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch scholarships: Invalid response');
    }

    return result.data;
  },

  /**
   * Get scholarship by ID
   * GET /api/admin/scholarships/{id}
   * 
   * @param id - Scholarship ID (UUID)
   * @returns Scholarship details
   */
  getById: async (id: string): Promise<ScholarshipResponse> => {
    const response = await http.get<Result<ScholarshipResponse>>(
      `/api/admin/scholarships/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch scholarship ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new scholarship
   * POST /api/admin/scholarships
   * 
   * @param request - Scholarship data (name required)
   * @returns Created scholarship
   */
  create: async (
    request: ScholarshipRequest
  ): Promise<ScholarshipResponse> => {
    const response = await http.post<Result<ScholarshipResponse>>(
      '/api/admin/scholarships',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create scholarship: Invalid response');
    }

    return result.data;
  },

  /**
   * Update scholarship
   * PUT /api/admin/scholarships/{id}
   * 
   * @param id - Scholarship ID (UUID)
   * @param request - Scholarship data (all fields optional)
   * @returns Updated scholarship
   */
  update: async (
    id: string,
    request: ScholarshipRequest
  ): Promise<ScholarshipResponse> => {
    const response = await http.put<Result<ScholarshipResponse>>(
      `/api/admin/scholarships/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update scholarship ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete scholarship (logical delete: status = archived)
   * PUT /api/admin/scholarships/{id} with status = archived
   * 
   * @param id - Scholarship ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    await scholarshipService.update(id, { status: 'archived' });
  },
};
