import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
});
