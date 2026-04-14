import { z } from 'zod';

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
 * Validator for updating a school's details.
 */
export const updateSchoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters').optional(),
  code: z.string().min(2, 'School code is required').toUpperCase().optional(),
  imagekitPublicKey: z.string().optional(),
  imagekitPrivateKey: z.string().optional(),
  imagekitUrlEndpoint: z.string().url('Invalid endpoint URL').optional().or(z.literal('')),
  imagekitFolder: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(), // For soft delete/status management
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

/**
 * Validator for creating a new user (Staff/Admin).
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'VENDOR'] as const, {
    message: 'Please select a valid system role',
  }),
  schoolId: z.number().optional(), // If assigned to a school
});

/**
 * Validator for onboarding a new vendor.
 */
export const createVendorSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  vendorName: z.string().min(2, 'Vendor name is required'),
  phoneNumber: z.string().min(5, 'Valid phone number is required'),
  location: z.string().optional(),
});

export type RegisterSchoolFormValues = z.infer<typeof registerSchoolSchema>;
export type UpdateSchoolFormValues = z.infer<typeof updateSchoolSchema>;
export type ManageUserFormValues = z.infer<typeof manageUserSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type CreateVendorFormValues = z.infer<typeof createVendorSchema>;
