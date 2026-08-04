import { authRepository } from '../repositories/AuthRepository';
import { LoginDTO, SignupDTO, ResetPasswordDTO, UpdatePasswordDTO } from '../../../core/types/auth';

export class AuthService {
  async login(dto: LoginDTO) {
    const { data, error } = await authRepository.login(dto);
    if (error) throw new Error(error.message);
    return data;
  }

  async loginWithGoogle() {
    const { data, error } = await authRepository.loginWithGoogle();
    if (error) throw new Error(error.message);
    return data;
  }

  async signup(dto: SignupDTO) {
    const { data, error } = await authRepository.signup(dto);
    if (error) throw new Error(error.message);
    return data;
  }

  async logout() {
    const { error } = await authRepository.logout();
    if (error) throw new Error(error.message);
  }

  async getCurrentSession() {
    const { data, error } = await authRepository.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  }

  async getCurrentUser() {
    const { data, error } = await authRepository.getCurrentUser();
    if (error) throw new Error(error.message);
    return data.user;
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const { error } = await authRepository.resetPassword(dto);
    if (error) throw new Error(error.message);
  }

  async updatePassword(dto: UpdatePasswordDTO) {
    const { data, error } = await authRepository.updatePassword(dto);
    if (error) throw new Error(error.message);
    return data;
  }

  async refreshSession() {
    const { data, error } = await authRepository.refreshSession();
    if (error) throw new Error(error.message);
    return data.session;
  }
}

export const authService = new AuthService();
