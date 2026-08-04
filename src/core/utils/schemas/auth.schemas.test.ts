import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema, resetPasswordSchema, updatePasswordSchema } from './auth.schemas';

describe('Auth Schemas Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login payload', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should invalidate incorrect email format', () => {
      const result = loginSchema.safeParse({ email: 'invalid-email', password: 'password123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('E-mail inválido');
      }
    });

    it('should invalidate empty password', () => {
      const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A senha é obrigatória');
      }
    });
  });

  describe('signupSchema', () => {
    it('should validate correct signup payload', () => {
      const result = signupSchema.safeParse({ name: 'John Doe', email: 'test@example.com', password: 'password123' });
      expect(result.success).toBe(true);
    });

    it('should invalidate short password', () => {
      const result = signupSchema.safeParse({ name: 'John Doe', email: 'test@example.com', password: 'short' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('A senha deve ter no mínimo 8 caracteres');
      }
    });
  });
});
