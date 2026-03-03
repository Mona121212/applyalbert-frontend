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
 * Curriculum Request DTO
 * Based on curricula table structure
 * Note: One program can have multiple curricula, one per language (unique constraint: program_id + language)
 */
export interface CurriculumRequest {
  language: string; // required
  structure: string; // JSON: curriculum structure
  status?: string; // draft | published | archived
}

/**
 * Curriculum Response DTO
 * Based on curricula table structure
 */
export interface CurriculumResponse {
  id: string; // UUID as string
  programId: string; // UUID as string
  language: string;
  structure: string; // JSON
  status: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Curriculum Service
 * 
 * Real API calls to backend curriculum endpoints:
 * - GET /api/admin/programs/{programId}/curricula (list all curricula for a program)
 * - GET /api/admin/programs/{programId}/curricula/{id} (get by ID)
 * - POST /api/admin/programs/{programId}/curricula (create)
 * - PUT /api/admin/programs/{programId}/curricula/{id} (update)
 * - DELETE /api/admin/programs/{programId}/curricula/{id} (delete)
 * 
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export const curriculumService = {
  /**
   * Get all curricula for a program
   * GET /api/admin/programs/{programId}/curricula
   * 
   * @param programId - Program ID (UUID)
   * @returns List of curricula
   */
  list: async (programId: string): Promise<CurriculumResponse[]> => {
    const response = await http.get<Result<CurriculumResponse[]>>(
      `/api/admin/programs/${programId}/curricula`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch curricula: Invalid response');
    }

    return result.data;
  },

  /**
   * Get curriculum by ID
   * GET /api/admin/programs/{programId}/curricula/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Curriculum ID (UUID)
   * @returns Curriculum details
   */
  getById: async (
    programId: string,
    id: string
  ): Promise<CurriculumResponse> => {
    const response = await http.get<Result<CurriculumResponse>>(
      `/api/admin/programs/${programId}/curricula/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch curriculum ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new curriculum
   * POST /api/admin/programs/{programId}/curricula
   * 
   * @param programId - Program ID (UUID)
   * @param request - Curriculum data (language required)
   * @returns Created curriculum
   */
  create: async (
    programId: string,
    request: CurriculumRequest
  ): Promise<CurriculumResponse> => {
    const response = await http.post<Result<CurriculumResponse>>(
      `/api/admin/programs/${programId}/curricula`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create curriculum: Invalid response');
    }

    return result.data;
  },

  /**
   * Update curriculum
   * PUT /api/admin/programs/{programId}/curricula/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Curriculum ID (UUID)
   * @param request - Curriculum data
   * @returns Updated curriculum
   */
  update: async (
    programId: string,
    id: string,
    request: CurriculumRequest
  ): Promise<CurriculumResponse> => {
    const response = await http.put<Result<CurriculumResponse>>(
      `/api/admin/programs/${programId}/curricula/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update curriculum ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete curriculum
   * DELETE /api/admin/programs/{programId}/curricula/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Curriculum ID (UUID)
   */
  delete: async (programId: string, id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/programs/${programId}/curricula/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete curriculum ${id}: Invalid response`);
    }
  },
};
