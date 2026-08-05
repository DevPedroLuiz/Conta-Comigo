import { supabase } from '../../../core/services/supabase';
import { LoginDTO, SignupDTO, ResetPasswordDTO, UpdatePasswordDTO } from '../../../core/types/auth';

export class AuthRepository {
  async login({ email, password }: LoginDTO) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async loginWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  }

  async signup({ email, password, name }: SignupDTO) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
      },
    });
  }

  async logout() {
    return supabase.auth.signOut();
  }

  async getSession() {
    return supabase.auth.getSession();
  }

  async getCurrentUser() {
    return supabase.auth.getUser();
  }

  async resetPassword({ email }: ResetPasswordDTO) {
    return supabase.auth.resetPasswordForEmail(email);
  }

  async updatePassword({ password }: UpdatePasswordDTO) {
    return supabase.auth.updateUser({ password });
  }

  async refreshSession() {
    return supabase.auth.refreshSession();
  }

  async deleteAccount() {
    return supabase.rpc('delete_user_account');
  }
}

export const authRepository = new AuthRepository();
