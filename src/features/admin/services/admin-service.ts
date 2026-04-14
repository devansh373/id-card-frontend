import { api } from '@/lib/api/client';
import { SchoolProfile } from '@/types/school';
import { UserProfile, UserRole } from '@/types/auth';
import { 
  RegisterSchoolFormValues, 
  ManageUserFormValues,
  UpdateSchoolFormValues,
  CreateUserFormValues,
  CreateVendorFormValues
} from '@/lib/validators/admin';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  // --- School Management ---
  
  /**
   * Registers a new school and its admin.
   */
  registerSchool: async (payload: RegisterSchoolFormValues) => {
    const res = await api.post<{ message: string; schoolId: number }>('/schools/register', payload);
    return res.data;
  },

  /**
   * Fetches all schools with pagination.
   */
  getSchools: async (page = 1, limit = 10): Promise<PaginatedResponse<SchoolProfile>> => {
    const res = await api.get<PaginatedResponse<SchoolProfile>>('/schools', {
      params: { page, limit },
    });
    return res.data;
  },

  /**
   * Updates an existing school profile.
   */
  updateSchool: async (schoolId: number, payload: UpdateSchoolFormValues) => {
    const res = await api.put<{ message: string; school: SchoolProfile }>(`/schools/${schoolId}`, payload);
    return res.data;
  },

  /**
   * Soft deletes a school.
   */
  deleteSchool: async (schoolId: number) => {
    const res = await api.delete<{ message: string }>(`/schools/${schoolId}`);
    return res.data;
  },

  // --- User Management ---

  /**
   * Fetches all users with filters and search.
   */
  getUsers: async (filters: UserFilters): Promise<PaginatedResponse<UserProfile>> => {
    const res = await api.get<PaginatedResponse<UserProfile>>('/auth/users', {
      params: filters,
    });
    return res.data;
  },

  /**
   * Creates a new user (Staff/Admin/Vendor directly)
   */
  createUser: async (payload: CreateUserFormValues | CreateVendorFormValues) => {
    const res = await api.post<{ message: string; user: UserProfile }>('/auth/users', payload);
    return res.data;
  },

  /**
   * Updates any user's profile (Role, Active Status, Vendor details, etc.)
   */
  updateUser: async (userId: number, payload: Partial<ManageUserFormValues>) => {
    const res = await api.put<{ message: string; user: UserProfile }>(`/auth/users/${userId}`, payload);
    return res.data;
  },

  /**
   * Soft deletes a user by setting isActive to false
   */
  deleteUser: async (userId: number) => {
    // Relying on updateUser to soft-delete
    const res = await api.put<{ message: string; user: UserProfile }>(`/auth/users/${userId}`, { isActive: false });
    return res.data;
  },

  /**
   * Fetch system-wide overview statistics.
   */
  getSystemStats: async () => {
    const res = await api.get<{
      stats: {
        totalSchools: number;
        activeVendors: number;
      };
      recentSchools: Partial<SchoolProfile>[];
    }>('/dashboard/super-admin');
    return res.data;
  }
};
