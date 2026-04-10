import { api } from '@/lib/api/client';
import type { Student, GetStudentsResponse, GetStudentsParams } from '@/types/student';

export const studentService = {
  /**
   * Fetch paginated and filtered students list.
   * Utilizes query params for server-side operations.
   */
  getStudents: async (params: GetStudentsParams): Promise<GetStudentsResponse> => {
    const res = await api.get<GetStudentsResponse>('/students', { params });
    return res.data;
  },

  /**
   * Fetch a single student record by ID.
   */
  getStudent: async (id: number): Promise<Student> => {
    const res = await api.get<{ student: Student }>(`/students/${id}`);
    return res.data.student;
  },

  /**
   * Upload an individual student photo or override an existing one.
   */
  uploadPhoto: async (studentId: number, photo: File): Promise<Student> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const res = await api.post<{ student: Student }>(
      `/students/${studentId}/photo`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.student;
  }
};
