import { api } from '@/lib/api/client';
import type { 
  SchoolProfile, 
  UpdateSchoolSetupPayload, 
  UpdateImageKitPayload, 
  UploadSignaturesPayload 
} from '@/types/school';

export const schoolService = {
  /**
   * Fetches the specific school details.
   * Based on the API specs, getting user profile returns nested school details for SCHOOL_ADMIN.
   * If we need pure school details, we fetch from `/auth/profile` and extract `school`,
   * since `GET /schools/:id` requires SUPER_ADMIN.
   * Let's fetch using profile for School Admin to be safe.
   */
  getSchoolSetup: async (): Promise<SchoolProfile> => {
    // School admins use their profile to get their own school data
    const res = await api.get('/auth/profile');
    if (!res.data.profile.school) {
      throw new Error("No school associated with this account.");
    }
    return res.data.profile.school;
  },

  /**
   * Update school setup including optional template and logo files.
   * Uses multipart/form-data.
   */
  updateSchoolSetup: async (payload: UpdateSchoolSetupPayload): Promise<SchoolProfile> => {
    const formData = new FormData();
    
    // Append standard fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Append files if they exist
    if (payload.logo instanceof File) {
      formData.append('logo', payload.logo);
    }
    if (payload.template instanceof File) {
      formData.append('template', payload.template);
    }

    const res = await api.put<{ message: string, school: SchoolProfile }>(
      '/schools/setup', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.school;
  },

  /**
   * Update ImageKit settings. 
   * Note: Required only if Super Admin delegates this, but per docs, mostly Super Admin does this.
   * Added for future-proofing or if School Admin has access.
   */
  updateImageKit: async (schoolId: number, payload: UpdateImageKitPayload): Promise<SchoolProfile> => {
     const res = await api.put<{ message: string, school: SchoolProfile }>(
      `/schools/${schoolId}/imagekit`,
      payload
    );
    return res.data.school;
  },

  /**
   * Upload principal and authority signatures.
   */
  uploadSignatures: async (schoolId: number, payload: UploadSignaturesPayload): Promise<SchoolProfile> => {
    const formData = new FormData();
    if (payload.principal instanceof File) {
      formData.append('principal', payload.principal);
    }
    if (payload.authority instanceof File) {
      formData.append('authority', payload.authority);
    }

    const res = await api.post<{ message: string, school: SchoolProfile }>(
      `/schools/${schoolId}/signatures`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.school;
  }
};
