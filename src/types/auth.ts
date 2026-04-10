// All TypeScript types derived from the backend API documentation

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'VENDOR';
export type VendorStatus = 'ONBOARDING' | 'ACTIVE' | 'INACTIVE';

export interface School {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  templateUrl?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  // School Admin / Teacher fields
  school?: School;
  schoolId?: number;
  // Vendor fields
  vendorName?: string;
  phoneNumber?: string;
  location?: string;
  vendorStatus?: VendorStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    role: UserRole;
    mustChangePassword: boolean;
  };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
