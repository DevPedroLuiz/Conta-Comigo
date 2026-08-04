import { EmptyState } from '../../../core/ui/components/empty-state';
import { Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../core/ui/components/button';

export function AccountEmptyState() {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
      title="Nenhuma conta encontrada"
      description="Você ainda não cadastrou nenhuma conta financeira."
      action={
        <Button onClick={() => navigate('/accounts/new')}>
          Nova Conta
        </Button>
      }
    />
  );
}
