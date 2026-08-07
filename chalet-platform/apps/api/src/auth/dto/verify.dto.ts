import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;

export const ResendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['verify', 'reset']),
});
export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
