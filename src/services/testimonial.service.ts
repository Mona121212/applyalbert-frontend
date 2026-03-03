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
 * Testimonial Request DTO matching TestimonialRequest.java
 * POST (create): studentName and quote required
 * PUT (update): all fields optional
 */
export interface TestimonialRequest {
  studentName?: string; // max 255, required for create
  title?: string; // max 255
  quote?: string; // max 4096, required for create
  story?: string; // max 8192
  rating?: number; // 1-5, required for create
  programId?: string; // UUID as string
  institutionId?: string; // UUID as string, required for create (readonly display)
  photoUrl?: string; // max 2048
  status?: string; // draft | published | archived
  comment?: string; // max 500, optional
}

/**
 * Testimonial Response DTO matching TestimonialResponse.java
 */
export interface TestimonialResponse {
  id: string; // UUID as string
  studentName: string;
  title?: string;
  quote: string;
  story?: string;
  rating: number; // 1-5
  programId?: string; // UUID as string
  institutionId: string; // UUID as string
  photoUrl?: string;
  status: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  comment?: string;
}

/**
 * Testimonial Service
 * 
 * Real API calls to backend testimonial endpoints:
 * - GET /api/admin/testimonials (paginated list)
 * - GET /api/admin/testimonials/{id} (get by ID)
 * - POST /api/admin/testimonials (create)
 * - PUT /api/admin/testimonials/{id} (update)
 * - DELETE /api/admin/testimonials/{id} (delete)
 * - PUT /api/admin/testimonials/{id}/publish (publish)
 * - PUT /api/admin/testimonials/{id}/unpublish (unpublish)
 */
export const testimonialService = {
  /**
   * Get paginated list of testimonials
   * GET /api/admin/testimonials?page=0&size=10&status=xxx
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 10)
   * @param status - Optional status filter
   * @returns Paginated list of testimonials
   */
  list: async (
    page: number = 0,
    size: number = 10,
    status?: string
  ): Promise<PageResult<TestimonialResponse>> => {
    const params: Record<string, any> = {
      page,
      size,
    };
    if (status) params.status = status;

    const response = await http.get<Result<PageResult<TestimonialResponse>>>(
      '/api/admin/testimonials',
      { params }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch testimonials: Invalid response');
    }

    return result.data;
  },

  /**
   * Get testimonial by ID
   * GET /api/admin/testimonials/{id}
   * 
   * @param id - Testimonial ID (UUID)
   * @returns Testimonial details
   */
  getById: async (id: string): Promise<TestimonialResponse> => {
    const response = await http.get<Result<TestimonialResponse>>(
      `/api/admin/testimonials/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch testimonial ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new testimonial
   * POST /api/admin/testimonials
   * 
   * @param request - Testimonial data (studentName and quote required)
   * @returns Created testimonial
   */
  create: async (
    request: TestimonialRequest
  ): Promise<TestimonialResponse> => {
    const response = await http.post<Result<TestimonialResponse>>(
      '/api/admin/testimonials',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create testimonial: Invalid response');
    }

    return result.data;
  },

  /**
   * Update testimonial
   * PUT /api/admin/testimonials/{id}
   * 
   * @param id - Testimonial ID (UUID)
   * @param request - Testimonial data (all fields optional)
   * @returns Updated testimonial
   */
  update: async (
    id: string,
    request: TestimonialRequest
  ): Promise<TestimonialResponse> => {
    const response = await http.put<Result<TestimonialResponse>>(
      `/api/admin/testimonials/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update testimonial ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete testimonial (logical delete: status = archived)
   * PUT /api/admin/testimonials/{id} with status = archived
   * 
   * @param id - Testimonial ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    await testimonialService.update(id, { status: 'archived' });
  },

  /**
   * Publish testimonial
   * PUT /api/admin/testimonials/{id}/publish
   * 
   * @param id - Testimonial ID (UUID)
   */
  publish: async (id: string): Promise<void> => {
    const response = await http.put<Result<void>>(
      `/api/admin/testimonials/${id}/publish`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to publish testimonial ${id}: Invalid response`);
    }
  },

  /**
   * Unpublish testimonial
   * PUT /api/admin/testimonials/{id}/unpublish
   * 
   * @param id - Testimonial ID (UUID)
   */
  unpublish: async (id: string): Promise<void> => {
    const response = await http.put<Result<void>>(
      `/api/admin/testimonials/${id}/unpublish`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to unpublish testimonial ${id}: Invalid response`);
    }
  },
};
