import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter pelo menos 2 caracteres'),
  type: z.enum(['EXPENSE', 'INCOME']),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
