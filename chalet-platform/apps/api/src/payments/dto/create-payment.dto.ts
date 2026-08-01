import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  method: z.literal('instapay'),
  transactionRef: z.string().min(3),
  amount: z.number().positive(),
});
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
