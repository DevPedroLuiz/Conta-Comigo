import { z } from 'zod';

export const creditCardSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  limit: z.coerce.number().positive('O limite deve ser maior que zero'),
  closing_day: z.coerce.number().min(1).max(31, 'Dia de fechamento inválido'),
  due_day: z.coerce.number().min(1).max(31, 'Dia de vencimento inválido'),
  brand: z.string().optional(),
  color: z.string().optional(),
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;
