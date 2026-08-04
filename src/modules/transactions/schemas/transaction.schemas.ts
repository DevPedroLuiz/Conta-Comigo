import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  category_id: z.string().min(1, 'A categoria é obrigatória'),
  account_id: z.string().min(1, 'A conta é obrigatória'),
  date: z.string().min(1, 'A data é obrigatória'),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
