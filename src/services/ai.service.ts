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
 * AI Reindex Response
 */
export interface AiReindexResponse {
  indexed: number;
}

/**
 * AI Service
 * 
 * Real API calls to backend AI endpoints:
 * - POST /api/admin/ai/reindex (rebuild ai_sources table from published content)
 */
export const aiService = {
  /**
   * Rebuild AI knowledge base index
   * POST /api/admin/ai/reindex
   * 
   * This endpoint:
   * 1. Deletes all existing rows in ai_sources table
   * 2. Rebuilds ai_sources from all published content (programs, requirements, etc.)
   * 3. Returns count of indexed rows
   * 
   * @returns Reindex result with count of indexed rows
   */
  reindex: async (): Promise<AiReindexResponse> => {
    const response = await http.post<Result<AiReindexResponse>>(
      '/api/admin/ai/reindex'
    );

    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error('Failed to reindex AI knowledge base: Invalid response');
    }

    return result.data;
  },
};
