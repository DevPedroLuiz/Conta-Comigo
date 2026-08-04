import { EmptyState } from '../../../core/ui/components/empty-state';
import { Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../core/ui/components/button';

export function TransactionEmptyState() {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={<Receipt className="h-10 w-10 text-muted-foreground" />}
      title="Nenhuma transação encontrada"
      description="Você ainda não possui transações neste período ou filtro."
      action={
        <Button onClick={() => navigate('/transactions/new')}>
          Nova Transação
        </Button>
      }
    />
  );
}
