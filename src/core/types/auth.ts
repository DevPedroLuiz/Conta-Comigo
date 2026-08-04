import { z } from 'zod';
import { 
  loginSchema, 
  signupSchema, 
  resetPasswordSchema, 
  updatePasswordSchema 
} from '../utils/schemas/auth.schemas';

export type AuthUser = {
  id: string;
  email: string;
  userMetadata?: Record<string, any>;
  createdAt: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: AuthUser;
};

export type LoginDTO = z.infer<typeof loginSchema>;
export type SignupDTO = z.infer<typeof signupSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;

export type AuthState = 'Authenticated' | 'Unauthenticated' | 'Loading' | 'ExpiredSession' | 'Offline';
