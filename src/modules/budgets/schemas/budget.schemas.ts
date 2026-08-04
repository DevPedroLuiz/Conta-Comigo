import { z } from 'zod';

export const budgetSchema = z.object({
  category_id: z.string().min(1, 'Selecione uma categoria'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  limit_amount: z.coerce.number().positive('O valor deve ser maior que zero'),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
