import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
});

export const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
});

export type ClassFormValues = z.infer<typeof classSchema>;
export type SectionFormValues = z.infer<typeof sectionSchema>;
