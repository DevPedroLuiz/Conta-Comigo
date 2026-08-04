import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(3, 'O nome da conta deve ter pelo menos 3 caracteres'),
  type: z.enum(['CHECKING_ACCOUNT', 'SAVINGS_ACCOUNT', 'CASH', 'INVESTMENT', 'CREDIT_CARD']),
  initial_balance: z.coerce.number(),
  currency: z.string().default('BRL'),
});

export type AccountFormData = {
  name: string;
  type: 'CHECKING_ACCOUNT' | 'SAVINGS_ACCOUNT' | 'CASH' | 'INVESTMENT' | 'CREDIT_CARD';
  initial_balance: number;
  currency: string;
};
