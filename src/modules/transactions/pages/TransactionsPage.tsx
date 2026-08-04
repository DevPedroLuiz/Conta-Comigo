import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { Transaction, TransactionType } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionEmptyState } from '../components/TransactionEmptyState';
import { TransactionFilters } from '../components/TransactionFilters';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';

export function TransactionsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await transactionService.getTransactions({
      userId: user.id,
      type: filterType === 'ALL' ? undefined : filterType,
    });
    
    if (error) {
      toast.error('Erro ao carregar transações');
    } else if (data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [user?.id, filterType]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      const { error } = await transactionService.deleteTransaction(user.id, id);
      if (error) {
        toast.error('Erro ao excluir transação');
      } else {
        toast.success('Transação excluída com sucesso');
        loadTransactions();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <Button onClick={() => navigate('/transactions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <TransactionFilters type={filterType} onChangeType={setFilterType} />

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : transactions.length === 0 ? (
        <TransactionEmptyState />
      ) : (
        <TransactionTable transactions={transactions} onDelete={handleDelete} />
      )}
    </div>
  );
}
