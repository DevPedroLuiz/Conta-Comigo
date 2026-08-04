import { z } from 'zod';

export const subscriptionSchema = z.object({
  site: z.string().min(2, 'O site deve ter pelo menos 2 caracteres'),
  plan: z.string().optional(),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  billing_day: z.coerce.number().min(1).max(31, 'Dia de cobrança inválido'),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
