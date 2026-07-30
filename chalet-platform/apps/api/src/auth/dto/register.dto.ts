import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().min(8).optional(),
});
export type RegisterDto = z.infer<typeof RegisterSchema>;
