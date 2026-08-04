import { z } from 'zod';

export const investmentSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  broker: z.string().min(2, 'A corretora deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
});

export type InvestmentFormData = z.infer<typeof investmentSchema>;

export const assetSchema = z.object({
  investment_id: z.string().min(1, 'Selecione uma corretora'),
  ticker: z.string().min(1, 'O ticker é obrigatório'),
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['STOCK', 'FII', 'ETF', 'CRYPTO', 'FIXED_INCOME', 'TREASURY', 'OTHER']),
});

export type AssetFormData = z.infer<typeof assetSchema>;

export const movementSchema = z.object({
  type: z.enum(['BUY', 'SELL']),
  account_id: z.string().min(1, 'Selecione uma conta bancária'),
  quantity: z.coerce.number().positive('A quantidade deve ser maior que zero'),
  price: z.coerce.number().min(0, 'O preço deve ser maior ou igual a zero'),
  date: z.string().min(1, 'A data é obrigatória'),
});

export type MovementFormData = z.infer<typeof movementSchema>;

export const dividendSchema = z.object({
  account_id: z.string().min(1, 'Selecione uma conta bancária'),
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  date: z.string().min(1, 'A data é obrigatória'),
});

export type DividendFormData = z.infer<typeof dividendSchema>;
