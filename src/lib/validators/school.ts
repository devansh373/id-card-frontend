import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Helper to validate files from react-dropzone
const imageFileSchema = z
  .any()
  .refine((files) => !files || files?.length === 0 || files?.[0] instanceof File, "Must be a file.")
  .refine(
    (files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    ".jpg, .jpeg, .png and .webp files are accepted."
  )
  .optional();

export const generalSetupSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  affiliationNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationDetails: z.string().optional(),
  logo: imageFileSchema,
  template: imageFileSchema,
});

export const signaturesSchema = z.object({
  principal: imageFileSchema,
  authority: imageFileSchema,
});

export const imageKitSchema = z.object({
  imagekitPublicKey: z.string().min(1, 'Public key is required'),
  imagekitPrivateKey: z.string().min(1, 'Private key is required'),
  imagekitUrlEndpoint: z.string().url('Must be a valid URL'),
  imagekitFolder: z.string().min(1, 'Folder path is required'),
});

export type GeneralSetupFormValues = z.infer<typeof generalSetupSchema>;
export type SignaturesFormValues = z.infer<typeof signaturesSchema>;
export type ImageKitFormValues = z.infer<typeof imageKitSchema>;
