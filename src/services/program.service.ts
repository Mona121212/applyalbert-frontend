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
 * Program Request DTO matching ProgramRequest.java
 * POST (create): name required
 * PUT (update): all fields optional
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export interface ProgramRequest {
  name?: string; // max 255, required for create
  url?: string; // max 2048
  route?: string; // max 255
  admissionLogic?: string; // max 1024
  campusId?: string; // UUID as string
  departmentId?: string; // UUID as string
  credential?: string; // max 128
  fieldOfStudy?: string; // max 512
  programLevel?: string; // max 128
  delivery?: string; // max 256
  durationMonths?: number;
  durationText?: string; // max 512
  overview?: string; // max 8192
  curriculumOverview?: string; // max 8192
  careerOutcomes?: string; // max 4096
  coopAvailable?: boolean;
  internationalAvailable?: boolean;
  domesticAvailable?: boolean;
  transferCreditsAvailable?: boolean;
  transferNote?: string; // max 2048
  pathwayPrograms?: string; // max 1024
  specialNotes?: string; // max 4096
  programCredits?: string; // max 256
  scholarshipIds?: string[]; // UUID array
  nocCodes?: string[];
  skills?: string[];
  careerPaths?: string[];
  comment?: string; // max 500, optional
}

/**
 * Program Response DTO matching ProgramResponse.java
 */
export interface ProgramResponse {
  id: string; // UUID as string
  code?: string;
  name: string;
  url?: string;
  route?: string;
  admissionLogic?: string;
  institutionId: string; // UUID as string
  campusId?: string; // UUID as string
  departmentId?: string; // UUID as string
  credential?: string;
  fieldOfStudy?: string;
  programLevel?: string;
  delivery?: string;
  durationMonths?: number;
  durationText?: string;
  overview?: string;
  curriculumOverview?: string;
  careerOutcomes?: string;
  coopAvailable?: boolean;
  internationalAvailable?: boolean;
  domesticAvailable?: boolean;
  transferCreditsAvailable?: boolean;
  transferNote?: string;
  pathwayPrograms?: string;
  specialNotes?: string;
  programCredits?: string;
  comment?: string;
  status: string; // draft | in_review | approved | published | archived | scheduled
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Program Service
 * 
 * Real API calls to backend program endpoints:
 * - GET /api/admin/programs (paginated list)
 * - GET /api/admin/programs/{id} (get by ID)
 * - POST /api/admin/programs (create)
 * - PUT /api/admin/programs/{id} (update)
 * - DELETE /api/admin/programs/{id} (delete - logical delete: backend changes status to archived)
 * - POST /api/admin/programs/{id}/rollback?revisionNo={no} (rollback)
 * 
 * Note: Staff users should NOT send institutionId - backend extracts from JWT
 */
export const programService = {
  /**
   * Get paginated list of programs
   * GET /api/admin/programs?page=0&size=10
   * 
   * @param page - Page number (0-based, default: 0)
   * @param size - Page size (default: 10)
   * @returns Paginated list of programs
   */
  list: async (
    page: number = 0,
    size: number = 10
  ): Promise<PageResult<ProgramResponse>> => {
    const response = await http.get<Result<PageResult<ProgramResponse>>>(
      '/api/admin/programs',
      {
        params: {
          page,
          size,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to fetch programs: Invalid response');
    }

    return result.data;
  },

  /**
   * Get program by ID
   * GET /api/admin/programs/{id}
   * 
   * @param id - Program ID (UUID)
   * @returns Program details
   */
  getById: async (id: string): Promise<ProgramResponse> => {
    const response = await http.get<Result<ProgramResponse>>(
      `/api/admin/programs/${id}`
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to fetch program ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Create new program
   * POST /api/admin/programs
   * 
   * @param request - Program data (name required)
   * @returns Created program
   */
  create: async (
    request: ProgramRequest
  ): Promise<ProgramResponse> => {
    const response = await http.post<Result<ProgramResponse>>(
      '/api/admin/programs',
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to create program: Invalid response');
    }

    return result.data;
  },

  /**
   * Update program
   * PUT /api/admin/programs/{id}
   * 
   * @param id - Program ID (UUID)
   * @param request - Program data (all fields optional)
   * @returns Updated program
   */
  update: async (
    id: string,
    request: ProgramRequest
  ): Promise<ProgramResponse> => {
    const response = await http.put<Result<ProgramResponse>>(
      `/api/admin/programs/${id}`,
      request
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to update program ${id}: Invalid response`);
    }

    return result.data;
  },

  /**
   * Delete program (logical delete: backend changes status to archived)
   * DELETE /api/admin/programs/{id}
   * 
   * @param id - Program ID (UUID)
   */
  delete: async (id: string): Promise<void> => {
    const response = await http.delete<Result<void>>(
      `/api/admin/programs/${id}`
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to delete program ${id}: Invalid response`);
    }
  },

  /**
   * Rollback program to a previous revision
   * POST /api/admin/programs/{id}/rollback?revisionNo={no}
   * 
   * @param id - Program ID (UUID)
   * @param revisionNo - Revision number to rollback to
   * @returns Rolled back program
   */
  rollback: async (
    id: string,
    revisionNo: number
  ): Promise<ProgramResponse> => {
    const response = await http.post<Result<ProgramResponse>>(
      `/api/admin/programs/${id}/rollback`,
      null,
      {
        params: {
          revisionNo,
        },
      }
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(`Failed to rollback program ${id}: Invalid response`);
    }

    return result.data;
  },
};
