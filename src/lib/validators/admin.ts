import { z } from 'zod';
import { UserRole, VendorStatus } from '@/types/auth';

/**
 * Validator for onboarding a new school and its first admin.
 */
export const registerSchoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  code: z.string().min(2, 'School code is required (e.g. SCH001)').toUpperCase(),
  adminEmail: z.string().email('Invalid administrator email'),
  // Optional ImageKit defaults
  imagekitPublicKey: z.string().optional(),
  imagekitPrivateKey: z.string().optional(),
  imagekitUrlEndpoint: z.string().url('Invalid endpoint URL').optional().or(z.literal('')),
  imagekitFolder: z.string().optional(),
});

/**
 * Validator for system-wide user management and role editing.
 */
export const manageUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'VENDOR'], {
    message: 'Please select a valid system role',
  }),
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
  // Vendor specific
  vendorName: z.string().optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  vendorStatus: z.enum(['ONBOARDING', 'ACTIVE', 'INACTIVE']).optional(),
  schoolId: z.number().nullable().optional(),
});

export type RegisterSchoolFormValues = z.infer<typeof registerSchoolSchema>;
export type ManageUserFormValues = z.infer<typeof manageUserSchema>;
