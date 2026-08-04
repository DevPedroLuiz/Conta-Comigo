import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, useSession, useUser } from './useAuth';
import * as AuthProviderModule from '../../../core/providers/AuthProvider';

// Mock the AuthContext
vi.mock('../../../core/providers/AuthProvider', () => ({
  useAuthContext: vi.fn(),
}));

describe('useAuth Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth', () => {
    it('should return correct state when Authenticated', () => {
      vi.mocked(AuthProviderModule.useAuthContext).mockReturnValue({
        session: {} as any,
        user: {} as any,
        authState: 'Authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isUnauthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return correct state when Loading', () => {
      vi.mocked(AuthProviderModule.useAuthContext).mockReturnValue({
        session: null,
        user: null,
        authState: 'Loading',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUser', () => {
    it('should return mapped AuthUser when user exists', () => {
      const mockSupabaseUser = {
        id: '123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
        created_at: '2023-01-01',
      } as any;

      vi.mocked(AuthProviderModule.useAuthContext).mockReturnValue({
        session: {} as any,
        user: mockSupabaseUser,
        authState: 'Authenticated',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current).toEqual({
        id: '123',
        email: 'test@example.com',
        userMetadata: { name: 'Test User' },
        createdAt: '2023-01-01',
      });
    });

    it('should return null when user does not exist', () => {
      vi.mocked(AuthProviderModule.useAuthContext).mockReturnValue({
        session: null,
        user: null,
        authState: 'Unauthenticated',
      });

      const { result } = renderHook(() => useUser());

      expect(result.current).toBeNull();
    });
  });
});
