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
 * Publish Service
 * 
 * Real API calls to backend publish workflow endpoints:
 * - POST /api/admin/publish/{programId}/submit (draft -> in_review)
 * - POST /api/admin/publish/{programId}/approve (in_review -> approved)
 * - POST /api/admin/publish/{programId}/publish (approved -> published)
 * - POST /api/admin/publish/{programId}/unpublish (published -> draft)
 * - POST /api/admin/publish/{programId}/schedule (schedule publish at future time)
 * 
 * Note: All operations require authentication and proper role permissions
 */
export const publishService = {
  /**
   * Submit program for review (draft -> in_review)
   * POST /api/admin/publish/{programId}/submit
   * 
   * @param programId - Program ID (UUID)
   */
  submitForReview: async (programId: string): Promise<void> => {
    const response = await http.post<Result<void>>(
      `/api/admin/publish/${programId}/submit`,
      null
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to submit program ${programId} for review: Invalid response`);
    }
  },

  /**
   * Approve program (in_review -> approved)
   * POST /api/admin/publish/{programId}/approve
   * 
   * @param programId - Program ID (UUID)
   */
  approve: async (programId: string): Promise<void> => {
    const response = await http.post<Result<void>>(
      `/api/admin/publish/${programId}/approve`,
      null
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to approve program ${programId}: Invalid response`);
    }
  },

  /**
   * Publish program (approved -> published)
   * POST /api/admin/publish/{programId}/publish
   * 
   * @param programId - Program ID (UUID)
   */
  publish: async (programId: string): Promise<void> => {
    const response = await http.post<Result<void>>(
      `/api/admin/publish/${programId}/publish`,
      null
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to publish program ${programId}: Invalid response`);
    }
  },

  /**
   * Unpublish program (published -> draft)
   * POST /api/admin/publish/{programId}/unpublish
   * 
   * @param programId - Program ID (UUID)
   */
  unpublish: async (programId: string): Promise<void> => {
    const response = await http.post<Result<void>>(
      `/api/admin/publish/${programId}/unpublish`,
      null
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to unpublish program ${programId}: Invalid response`);
    }
  },

  /**
   * Schedule publish at a future time
   * POST /api/admin/publish/{programId}/schedule
   * 
   * @param programId - Program ID (UUID)
   * @param publishAt - ISO 8601 timestamp for scheduled publish
   */
  schedule: async (programId: string, publishAt: string): Promise<void> => {
    const response = await http.post<Result<void>>(
      `/api/admin/publish/${programId}/schedule`,
      {
        publishAt,
      }
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(`Failed to schedule publish for program ${programId}: Invalid response`);
    }
  },
};
