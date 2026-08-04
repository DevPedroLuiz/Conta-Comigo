import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { AuthState } from '../types/auth';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  authState: AuthState;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  authState: 'Loading',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('Loading');

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (!navigator.onLine) {
          setAuthState('Offline');
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          setAuthState('ExpiredSession');
          return;
        }

        const currentSession = data.session;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession) {
          setAuthState('Authenticated');
        } else {
          setAuthState('Unauthenticated');
        }
      } catch (err) {
        if (mounted) setAuthState('Unauthenticated');
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setAuthState('Authenticated');
      } else if (event === 'SIGNED_OUT') {
        setAuthState('Unauthenticated');
      }
    });

    const handleOnline = () => {
      if (session) setAuthState('Authenticated');
      else setAuthState('Unauthenticated');
    };

    const handleOffline = () => {
      setAuthState('Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, authState }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

