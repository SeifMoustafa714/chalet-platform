import { z } from 'zod';

// Admin can edit any submitted field before approval
export const ReviewEditSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(20).optional(),
  location: z.string().optional(),
  region: z.enum(['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm']).optional(),
  amenities: z.array(z.string()).optional(),
  maxGuests: z.number().int().positive().optional(),
  images: z.array(z.string().url()).optional(),
  adminNotes: z.string().optional(),
});
export type ReviewEditDto = z.infer<typeof ReviewEditSchema>;

export const RejectSchema = z.object({
  reason: z.string().min(5),
});
export type RejectDto = z.infer<typeof RejectSchema>;
