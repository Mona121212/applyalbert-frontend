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
 * Program Cost Request DTO
 * Based on ProgramTuitionFee entity structure
 * Note: One program can only have one cost record (1:1 relationship)
 */
export interface ProgramCostRequest {
  currency?: string; // CAD | USD
  tuitionDomestic?: number; // BigDecimal
  tuitionInternational?: number; // BigDecimal
  fees?: string; // JSON: lab fees, extra costs
  estimateLivingCost?: number; // BigDecimal
  notes?: string;
  status?: string; // draft | published | archived
}

/**
 * Program Cost Response DTO
 * Based on ProgramTuitionFee entity structure
 */
export interface ProgramCostResponse {
  id: string; // UUID as string
  programId: string; // UUID as string
  currency?: string;
  tuitionDomestic?: number;
  tuitionInternational?: number;
  fees?: string; // JSON
  estimateLivingCost?: number;
  notes?: string;
  status: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Program Cost Service
 * 
 * Real API calls to backend program cost endpoints:
 * - GET /api/admin/programs/{programId}/costs (get cost for a program - returns single record or null)
 * - POST /api/admin/programs/{programId}/costs (create - only if not exists)
 * - PUT /api/admin/programs/{programId}/costs/{id} (update)
 * - DELETE /api/admin/programs/{programId}/costs/{id} (delete)
 * 
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export const programCostService = {
  /**
   * Get cost for a program (1:1 relationship, returns single record or null)
   * GET /api/admin/programs/{programId}/costs
   * 
   * @param programId - Program ID (UUID)
   * @returns Cost details or null if not exists
   */
  getByProgramId: async (programId: string): Promise<ProgramCostResponse | null> => {
    try {
      const response = await http.get<Result<ProgramCostResponse>>(
        `/api/admin/programs/${programId}/costs`
      );

      const result = response.data;

      if (!result.success || !result.data) {
        return null;
      }

      return result.data;
    } catch (error: any) {
      // If 404, return null (cost not exists yet)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get cost by ID
   * GET /api/admin/programs/{programId}/costs/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Cost ID (UUID)
   * @returns Cost details
   */
  getById: async (
    programId: string,
    id: string
  ): Promise<ProgramCostResponse> => {
    const response = await http.get<Result<ProgramCostResponse>>(
      `/api/admin/programs/${programId}/costs/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch cost ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new cost
   * POST /api/admin/programs/{programId}/costs
   * 
   * @param programId - Program ID (UUID)
   * @param request - Cost data
   * @returns Created cost
   */
  create: async (
    programId: string,
    request: ProgramCostRequest
  ): Promise<ProgramCostResponse> => {
    const response = await http.post<Result<ProgramCostResponse>>(
      `/api/admin/programs/${programId}/costs`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create cost: Invalid response');
    }

    return result.data;
  },

  /**
   * Update cost
   * PUT /api/admin/programs/{programId}/costs/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Cost ID (UUID)
   * @param request - Cost data
   * @returns Updated cost
   */
  update: async (
    programId: string,
    id: string,
    request: ProgramCostRequest
  ): Promise<ProgramCostResponse> => {
    const response = await http.put<Result<ProgramCostResponse>>(
      `/api/admin/programs/${programId}/costs/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update cost ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete cost
   * DELETE /api/admin/programs/{programId}/costs/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Cost ID (UUID)
   */
  delete: async (programId: string, id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/programs/${programId}/costs/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete cost ${id}: Invalid response`);
    }
  },
};
