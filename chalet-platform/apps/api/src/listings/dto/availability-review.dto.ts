import { z } from 'zod';

export const ToggleAvailabilitySchema = z.object({
  date: z.string(),
  isBlocked: z.boolean(),
});
export type ToggleAvailabilityDto = z.infer<typeof ToggleAvailabilitySchema>;

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
