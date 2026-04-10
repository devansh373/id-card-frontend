import { api } from '@/lib/api/client';
import type {
  ChangePasswordPayload,
  LoginCredentials,
  LoginResponse,
  UserProfile,
} from '@/types/auth';

export const authService = {
  /**
   * Authenticate user. Sets the JWT as an HTTP-only cookie on the backend.
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', credentials);
    return res.data;
  },

  /**
   * Destroy the session by clearing the HTTP-only cookie.
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * Fetch the current user's full profile.
   * This is the primary method for verifying session validity on page load.
   */
  getProfile: async (): Promise<UserProfile> => {
    const res = await api.get<{ profile: UserProfile }>('/auth/profile');
    return res.data.profile;
  },

  /**
   * Change password. Used for both voluntary and forced (mustChangePassword) changes.
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.post('/auth/change-password', payload);
  },
};
