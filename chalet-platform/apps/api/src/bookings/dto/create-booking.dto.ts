import { z } from 'zod';

export const CreateBookingSchema = z.object({
  listingId: z.string().uuid(),
  checkIn: z.string().datetime().or(z.string()),
  checkOut: z.string().datetime().or(z.string()),
  guests: z.number().int().positive(),
});
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;

export const ConfirmBookingSchema = z.object({
  quotedPrice: z.number().positive().optional(),
  adminNotes: z.string().optional(),
});
export type ConfirmBookingDto = z.infer<typeof ConfirmBookingSchema>;

export const AdminUpdateBookingSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().int().positive().optional(),
  quotedPrice: z.number().positive().optional(),
  adminNotes: z.string().optional(),
});
export type AdminUpdateBookingDto = z.infer<typeof AdminUpdateBookingSchema>;
