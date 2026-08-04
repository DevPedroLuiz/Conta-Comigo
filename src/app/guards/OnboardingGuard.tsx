import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '../../modules/auth/hooks/useAuth';
import { onboardingService } from '../../modules/onboarding/services/OnboardingService';

type OnboardingGuardProps = {
  children: ReactNode;
};

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const user = useUser();
  const location = useLocation();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user?.id) return;
      const status = await onboardingService.checkOnboardingStatus(user.id);
      setIsOnboarded(status);
    }
    
    if (isAuthenticated && user?.id) {
      checkOnboarding();
    }
  }, [isAuthenticated, user?.id]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isOnboarded === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
