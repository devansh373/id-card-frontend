import { api } from '@/lib/api/client';

export interface IDCardPreview {
  studentId: number;
  name: string;
  frontUrl?: string;
  backUrl?: string;
  status: 'NOT_READY' | 'READY' | 'PRINTED' | 'FAILED';
}

export interface IDCardFilter {
  schoolId?: number;
  classId?: number;
  sectionId?: number;
}

export const idCardService = {
  /**
   * Fetch ID card previews for a school/class/section
   */
  getPreviews: async (filters: IDCardFilter) => {
    const res = await api.get<{ data: IDCardPreview[] }>('/id-cards/previews', {
      params: filters,
    });
    return res.data;
  },

  /**
   * Manually trigger generation for a single student
   */
  generateSingle: async (studentId: number) => {
    const res = await api.get<{ 
      message: string; 
      frontUrl: string; 
      backUrl: string;
    }>(`/students/${studentId}/id-card/single-generate`);
    return res.data;
  },

  /**
   * Trigger bulk generation for multiple students
   */
  generateBulk: async (studentIds: number[]) => {
    const res = await api.post<{ message: string }>('/id-cards/bulk-generate', {
      studentIds,
    });
    return res.data;
  },

  /**
   * Trigger PDF printing for a batch of students
   */
  printCards: async (studentIds: number[]) => {
    const res = await api.post<{ message: string; pdfUrl: string }>('/id-cards/print', {
      studentIds,
    });
    return res.data;
  },
};
