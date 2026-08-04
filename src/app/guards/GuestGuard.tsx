import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';

type GuestGuardProps = {
  children: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        {/* Placeholder para Loading */}
        <span>Carregando...</span>
      </div>
    );
  }

  // Se o usuário já está autenticado, mande-o para o app principal
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
