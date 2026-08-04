import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(3, 'O nome da meta deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  target_amount: z.coerce.number().min(0.01, 'O valor objetivo deve ser maior que zero'),
  current_amount: z.coerce.number().min(0, 'O valor inicial não pode ser negativo').default(0),
  deadline: z.string().optional().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
});

export type GoalFormData = z.infer<typeof goalSchema>;

export const addProgressSchema = z.object({
  amount: z.coerce.number().min(0.01, 'O valor adicionado deve ser maior que zero'),
});

export type AddProgressFormData = z.infer<typeof addProgressSchema>;
