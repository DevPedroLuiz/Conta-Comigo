import { useMemo } from 'react';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { authService } from '../services/AuthService';
import { AuthUser, Session, AuthState } from '../../../core/types/auth';

export function useAuth() {
  const { authState } = useAuthContext();
  
  return useMemo(() => ({
    authState,
    isAuthenticated: authState === 'Authenticated',
    isUnauthenticated: authState === 'Unauthenticated',
    isLoading: authState === 'Loading',
    isOffline: authState === 'Offline',
    isExpired: authState === 'ExpiredSession',
    
    // Auth actions
    login: authService.login,
    loginWithGoogle: authService.loginWithGoogle,
    signup: authService.signup,
    logout: authService.logout,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
  }), [authState]);
}

export function useSession(): Session | null {
  const { session } = useAuthContext();
  // Safe cast since the structure aligns, although we might need to cast to our Session type
  // if Supabase's Session adds properties. But our type is standard.
  return session as unknown as Session | null;
}

export function useUser(): AuthUser | null {
  const { user } = useAuthContext();
  
  return useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email ?? '',
      userMetadata: user.user_metadata,
      createdAt: user.created_at,
    };
  }, [user]);
}
