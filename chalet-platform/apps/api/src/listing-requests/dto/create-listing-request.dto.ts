import { z } from 'zod';

export const CreateListingRequestSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  location: z.string(),
  region: z.enum(['north_coast', 'ain_sokhna', 'marsa_matrouh', 'sharm']),
  amenities: z.array(z.string()).default([]),
  maxGuests: z.number().int().positive(),
  images: z.array(z.string().url()).min(1),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  contactPhone: z.string().min(8),
  contactWhatsapp: z.string().optional(),
  availabilityNote: z.string().optional(),
});
export type CreateListingRequestDto = z.infer<typeof CreateListingRequestSchema>;
