import { z } from 'zod';

export const CreateListingSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  location: z.string(),
  region: z.enum(['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm']),
  amenities: z.array(z.string()).optional(),
  maxGuests: z.number().int().positive(),
  images: z.array(z.string().url()).min(1),
  contactPhone: z.string().optional(),
  basePrice: z.number().positive(),
  weekendPrice: z.number().positive().optional(),
  seasonalPrice: z.number().positive().optional(),
});
export type CreateListingDto = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(20).optional(),
  location: z.string().optional(),
  region: z.enum(['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm']).optional(),
  amenities: z.array(z.string()).optional(),
  maxGuests: z.number().int().positive().optional(),
  images: z.array(z.string().url()).optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean().optional(),
  basePrice: z.number().positive().optional(),
  weekendPrice: z.number().positive().optional(),
  seasonalPrice: z.number().positive().optional(),
});
export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;
