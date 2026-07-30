import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  method: z.enum(['vodafone_cash', 'instapay', 'bank_transfer', 'cash']),
  transactionRef: z.string().min(3),
  amount: z.number().positive(),
});
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
