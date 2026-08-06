import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { accountService } from '../services/AccountService';
import { supabase } from '../../../core/services/supabase';
import { Account, FinancialSummary } from '../types/account.types';
import { Button } from '../../../core/ui/components/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AccountList } from '../components/AccountList';
import { AccountSummary } from '../components/AccountSummary';
import { AccountEmptyState } from '../components/AccountEmptyState';
import { OpenFinanceConnectionsCard } from '../components/OpenFinanceConnectionsCard';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedInteraction } from '../../../core/ui/components/AnimatedInteraction';

export function AccountsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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
  }, [user?.id]);

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

  const handleSync = async (itemId: string) => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      // Get the current session to get the access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Usuário não autenticado.');
        return;
      }
      
      const response = await fetch('/api/sync-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ itemId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao sincronizar.');
      }

      const result = await response.json();
      toast.success(result.message || 'Sincronização concluída com sucesso!');
      
      // Reload accounts data to reflect new balance
      loadData();
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch (error: unknown) {
      console.error('Erro na sincronização:', error);
      if (error instanceof Error) {
         toast.error(`Falha na sincronização: ${error.message}`);
      } else {
         toast.error('Falha na sincronização.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Minhas Contas</h2>
        <AnimatedInteraction>
          <Button onClick={() => navigate('/accounts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </AnimatedInteraction>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : summary ? (
        <>
          <AccountSummary summary={summary} />
          
          <OpenFinanceConnectionsCard 
            accounts={summary.accounts} 
            onSync={handleSync}
            isSyncing={isSyncing}
          />

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
