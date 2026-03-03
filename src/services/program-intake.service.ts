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
 * Program Intake Request DTO
 * Based on ProgramIntake entity structure
 */
export interface ProgramIntakeRequest {
  intakeTerm?: string;
  startDate?: string; // LocalDate (YYYY-MM-DD)
  applicationDeadline?: string; // LocalDate (YYYY-MM-DD)
  seatsAvailable?: number;
  isOpen?: boolean;
  status?: string; // draft | published | archived
}

/**
 * Program Intake Response DTO
 * Based on ProgramIntake entity structure
 */
export interface ProgramIntakeResponse {
  id: string; // UUID as string
  programId: string; // UUID as string
  intakeTerm?: string;
  startDate?: string; // LocalDate (YYYY-MM-DD)
  applicationDeadline?: string; // LocalDate (YYYY-MM-DD)
  seatsAvailable?: number;
  isOpen?: boolean;
  status: string;
  publishedAt?: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Program Intake Service
 * 
 * Real API calls to backend program intake endpoints:
 * - GET /api/admin/programs/{programId}/intakes (list all intakes for a program)
 * - GET /api/admin/programs/{programId}/intakes/{id} (get by ID)
 * - POST /api/admin/programs/{programId}/intakes (create)
 * - PUT /api/admin/programs/{programId}/intakes/{id} (update)
 * - DELETE /api/admin/programs/{programId}/intakes/{id} (delete)
 * 
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export const programIntakeService = {
  /**
   * Get all intakes for a program
   * GET /api/admin/programs/{programId}/intakes
   * 
   * @param programId - Program ID (UUID)
   * @returns List of intakes
   */
  list: async (programId: string): Promise<ProgramIntakeResponse[]> => {
    const response = await http.get<Result<ProgramIntakeResponse[]>>(
      `/api/admin/programs/${programId}/intakes`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch program intakes: Invalid response');
    }

    return result.data;
  },

  /**
   * Get intake by ID
   * GET /api/admin/programs/{programId}/intakes/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Intake ID (UUID)
   * @returns Intake details
   */
  getById: async (
    programId: string,
    id: string
  ): Promise<ProgramIntakeResponse> => {
    const response = await http.get<Result<ProgramIntakeResponse>>(
      `/api/admin/programs/${programId}/intakes/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch intake ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new intake
   * POST /api/admin/programs/{programId}/intakes
   * 
   * @param programId - Program ID (UUID)
   * @param request - Intake data
   * @returns Created intake
   */
  create: async (
    programId: string,
    request: ProgramIntakeRequest
  ): Promise<ProgramIntakeResponse> => {
    const response = await http.post<Result<ProgramIntakeResponse>>(
      `/api/admin/programs/${programId}/intakes`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create intake: Invalid response');
    }

    return result.data;
  },

  /**
   * Update intake
   * PUT /api/admin/programs/{programId}/intakes/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Intake ID (UUID)
   * @param request - Intake data
   * @returns Updated intake
   */
  update: async (
    programId: string,
    id: string,
    request: ProgramIntakeRequest
  ): Promise<ProgramIntakeResponse> => {
    const response = await http.put<Result<ProgramIntakeResponse>>(
      `/api/admin/programs/${programId}/intakes/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update intake ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete intake
   * DELETE /api/admin/programs/{programId}/intakes/{id}
   * 
   * @param programId - Program ID (UUID)
   * @param id - Intake ID (UUID)
   */
  delete: async (programId: string, id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/programs/${programId}/intakes/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete intake ${id}: Invalid response`);
    }
  },
};
