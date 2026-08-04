import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { accountService } from '../services/AccountService';
import { Account, FinancialSummary } from '../types/account.types';
import { Button } from '../../../core/ui/components/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountList } from '../components/AccountList';
import { AccountSummary } from '../components/AccountSummary';
import { AccountEmptyState } from '../components/AccountEmptyState';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';

export function AccountsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await accountService.getFinancialSummary(user.id);
    
    if (error) {
      toast.error('Erro ao carregar contas');
    } else if (data) {
      setSummary(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Tem certeza que deseja excluir esta conta? Isso removerá todas as transações associadas!')) {
      const { error } = await accountService.deleteAccount(user.id, id);
      if (error) {
        toast.error('Erro ao excluir conta');
      } else {
        toast.success('Conta excluída com sucesso');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Minhas Contas</h2>
        <Button onClick={() => navigate('/accounts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : summary ? (
        <>
          <AccountSummary summary={summary} />
          {summary.accountsCount === 0 ? (
            <AccountEmptyState />
          ) : (
            <AccountList accounts={summary.accounts} onDelete={handleDelete} />
          )}
        </>
      ) : (
        <AccountEmptyState />
      )}
    </div>
  );
}
