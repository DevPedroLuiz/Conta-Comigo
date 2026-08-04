import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './AuthService';
import { authRepository } from '../repositories/AuthRepository';

// Mock the repository
vi.mock('../repositories/AuthRepository', () => ({
  authRepository: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getSession: vi.fn(),
    getCurrentUser: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    refreshSession: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully and return data', async () => {
    const mockData = { user: { id: '1' }, session: { access_token: 'token' } };
    vi.mocked(authRepository.login).mockResolvedValueOnce({ data: mockData, error: null } as any);

    const result = await authService.login({ email: 'test@test.com', password: 'password' });

    expect(authRepository.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(result).toEqual(mockData);
  });

  it('should throw an error on login failure', async () => {
    vi.mocked(authRepository.login).mockResolvedValueOnce({ data: null, error: { message: 'Invalid credentials' } } as any);

    await expect(authService.login({ email: 'test@test.com', password: 'wrong' }))
      .rejects
      .toThrow('Invalid credentials');
  });

  it('should signup successfully and return data', async () => {
    const mockData = { user: { id: '1' }, session: null };
    vi.mocked(authRepository.signup).mockResolvedValueOnce({ data: mockData, error: null } as any);

    const result = await authService.signup({ email: 'test@test.com', password: 'password', name: 'Test' });

    expect(authRepository.signup).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password', name: 'Test' });
    expect(result).toEqual(mockData);
  });

  it('should throw an error on signup failure', async () => {
    vi.mocked(authRepository.signup).mockResolvedValueOnce({ data: null, error: { message: 'Email already in use' } } as any);

    await expect(authService.signup({ email: 'test@test.com', password: 'password' }))
      .rejects
      .toThrow('Email already in use');
  });
  
  it('should logout successfully', async () => {
    vi.mocked(authRepository.logout).mockResolvedValueOnce({ error: null } as any);
    await expect(authService.logout()).resolves.toBeUndefined();
    expect(authRepository.logout).toHaveBeenCalled();
  });
});
