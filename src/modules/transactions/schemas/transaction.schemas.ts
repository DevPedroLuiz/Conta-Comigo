import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.enum(['INCOME', 'EXPENSE', 'TRANSFER_IN', 'TRANSFER_OUT'])),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  category_id: z.string().min(1, 'A categoria é obrigatória'),
  account_id: z.string().optional(),
  credit_card_id: z.string().optional(),
  date: z.string().min(1, 'A data é obrigatória'),
  notes: z.string().optional(),
  status: z.enum(['PAID', 'UNPAID']).default('PAID'),
  installments: z.coerce.number().min(1).optional(),
  is_internal_transfer: z.boolean().optional().default(false),
  is_subscription: z.boolean().optional().default(false),
  is_investment: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  if (!data.account_id && !data.credit_card_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Você deve selecionar uma conta ou um cartão',
      path: ['account_id'],
    });
  }
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
