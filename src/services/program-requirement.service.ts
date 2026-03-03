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
 * Program Requirement Request DTO
 * Based on ProgramRequirement entity structure
 */
export interface ProgramRequirementRequest {
    language: string; // required
    admissionText?: string;
    prerequisites?: string; // JSON
    studentType?: string; // all | domestic | international
    competitiveThreshold?: string;
    countryCode?: string; // ISO 3166-1 alpha-2
    systemName?: string;
    englishProficiency?: string; // JSON
    portfolioRequired?: boolean;
    notes?: string;
    status?: string; // draft | published | archived
}

/**
 * Program Requirement Response DTO
 * Based on ProgramRequirement entity structure
 */
export interface ProgramRequirementResponse {
    id: string; // UUID as string
    programId: string; // UUID as string
    language: string;
    admissionText?: string;
    prerequisites?: string; // JSON
    studentType?: string; // all | domestic | international
    competitiveThreshold?: string;
    countryCode?: string;
    systemName?: string;
    englishProficiency?: string; // JSON
    portfolioRequired?: boolean;
    notes?: string;
    status: string;
    publishedAt?: string; // ISO 8601 timestamp
    createdAt: string; // ISO 8601 timestamp
    updatedAt: string; // ISO 8601 timestamp
}

/**
 * Program Requirement Service
 * 
 * Real API calls to backend program requirement endpoints:
 * - GET /api/admin/programs/{programId}/requirements (list all requirements for a program)
 * - GET /api/admin/programs/{programId}/requirements/{id} (get by ID)
 * - POST /api/admin/programs/{programId}/requirements (create)
 * - PUT /api/admin/programs/{programId}/requirements/{id} (update)
 * - DELETE /api/admin/programs/{programId}/requirements/{id} (delete)
 * 
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export const programRequirementService = {
    /**
     * Get all requirements for a program
     * GET /api/admin/programs/{programId}/requirements
     * 
     * @param programId - Program ID (UUID)
     * @returns List of requirements
     */
    list: async (programId: string): Promise<ProgramRequirementResponse[]> => {
        const response = await http.get<Result<ProgramRequirementResponse[]>>(
            `/api/admin/programs/${programId}/requirements`
        );

        const result = response.data;

        if (!result.success || !result.data) {
            throw new Error('Failed to fetch program requirements: Invalid response');
        }

        return result.data;
    },

    /**
     * Get requirement by ID
     * GET /api/admin/programs/{programId}/requirements/{id}
     * 
     * @param programId - Program ID (UUID)
     * @param id - Requirement ID (UUID)
     * @returns Requirement details
     */
    getById: async (
        programId: string,
        id: string
    ): Promise<ProgramRequirementResponse> => {
        const response = await http.get<Result<ProgramRequirementResponse>>(
            `/api/admin/programs/${programId}/requirements/${id}`
        );

        const result = response.data;

        if (!result.success || !result.data) {
            throw new Error(`Failed to fetch requirement ${id}: Invalid response`);
        }

        return result.data;
    },

    /**
     * Create new requirement
     * POST /api/admin/programs/{programId}/requirements
     * 
     * @param programId - Program ID (UUID)
     * @param request - Requirement data
     * @returns Created requirement
     */
    create: async (
        programId: string,
        request: ProgramRequirementRequest
    ): Promise<ProgramRequirementResponse> => {
        const response = await http.post<Result<ProgramRequirementResponse>>(
            `/api/admin/programs/${programId}/requirements`,
            request
        );

        const result = response.data;

        if (!result.success || !result.data) {
            throw new Error('Failed to create requirement: Invalid response');
        }

        return result.data;
    },

    /**
     * Update requirement
     * PUT /api/admin/programs/{programId}/requirements/{id}
     * 
     * @param programId - Program ID (UUID)
     * @param id - Requirement ID (UUID)
     * @param request - Requirement data
     * @returns Updated requirement
     */
    update: async (
        programId: string,
        id: string,
        request: ProgramRequirementRequest
    ): Promise<ProgramRequirementResponse> => {
        const response = await http.put<Result<ProgramRequirementResponse>>(
            `/api/admin/programs/${programId}/requirements/${id}`,
            request
        );

        const result = response.data;

        if (!result.success || !result.data) {
            throw new Error(`Failed to update requirement ${id}: Invalid response`);
        }

        return result.data;
    },

    /**
     * Delete requirement
     * DELETE /api/admin/programs/{programId}/requirements/{id}
     * 
     * @param programId - Program ID (UUID)
     * @param id - Requirement ID (UUID)
     */
    delete: async (programId: string, id: string): Promise<void> => {
        const response = await http.delete<Result<void>>(
            `/api/admin/programs/${programId}/requirements/${id}`
        );

        const result = response.data;

        if (!result.success) {
            throw new Error(`Failed to delete requirement ${id}: Invalid response`);
        }
    },
};
