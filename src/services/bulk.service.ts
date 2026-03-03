import http from './http';
import type { ProgramRequest } from './program.service';

/**
 * Backend API response wrapper
 */
interface Result<T> {
  success: boolean;
  data: T;
  requestId?: string;
}

/**
 * Requirement Item DTO for bulk upload
 * Matches BulkProgramItemDto.RequirementItemDto
 */
export interface BulkRequirementItemDto {
  language?: string; // default: "en"
  admissionText?: string;
  prerequisites?: string; // JSON
  studentType?: string; // all | domestic | international
  competitiveThreshold?: string;
  countryCode?: string; // ISO 3166-1 alpha-2
  systemName?: string;
  englishProficiency?: string; // JSON
  portfolioRequired?: boolean;
  notes?: string;
}

/**
 * Bulk Program Item DTO
 * Matches BulkProgramItemDto.java
 */
export interface BulkProgramItemDto {
  program: ProgramRequest; // Required
  requirements?: BulkRequirementItemDto[]; // Optional
}

/**
 * Bulk Upload Response
 */
export interface BulkUploadResponse {
  created: number;
}

/**
 * Bulk Upload Service
 * 
 * Real API calls to backend bulk upload endpoints:
 * - POST /api/admin/bulk/programs (bulk create programs with requirements)
 * 
 * Note: institutionId is NOT sent - backend extracts from JWT
 */
export const bulkService = {
  /**
   * Bulk upload programs with requirements
   * POST /api/admin/bulk/programs
   * 
   * @param items - List of bulk program items (program + requirements)
   * @returns Upload result with count of created programs
   */
  uploadPrograms: async (
    items: BulkProgramItemDto[]
  ): Promise<BulkUploadResponse> => {
    const response = await http.post<Result<BulkUploadResponse>>(
      '/api/admin/bulk/programs',
      items
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to upload programs: Invalid response');
    }

    return result.data;
  },
};
