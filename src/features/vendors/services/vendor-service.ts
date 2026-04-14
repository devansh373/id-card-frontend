import { api } from '@/lib/api/client';
import type { School } from '@/types/auth';
import type { Student } from '@/types/student';

export interface VendorSchool extends School {
  stats: {
    totalStudents: number;
    pendingPhotos: number;
    readyToPrint: number;
    printed: number;
  };
}

export const vendorService = {
  /**
   * Get schools assigned to the logged-in vendor
   */
  getAssignedSchools: async () => {
    const res = await api.get<{ data: VendorSchool[] }>('/vendors/schools');
    return res.data;
  },

  /**
   * Get print queue for a school (students ready to print)
   */
  getPrintQueue: async (schoolId: number, classId?: number) => {
    const res = await api.get<{ data: Student[] }>('/vendors/print-queue', {
      params: { schoolId, classId },
    });
    return res.data;
  },

  /**
   * Mark students as printed
   */
  markAsPrinted: async (studentIds: number[]) => {
    const res = await api.post<{ message: string }>('/vendors/mark-printed', {
      studentIds,
    });
    return res.data;
  },
};
