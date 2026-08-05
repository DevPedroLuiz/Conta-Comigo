import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { Transaction, TransactionType } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Plus, Link as LinkIcon, Upload, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionEmptyState } from '../components/TransactionEmptyState';
import { TransactionFilters } from '../components/TransactionFilters';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { BankSyncModal } from '../../open-finance/components/BankSyncModal';
import { ImportTransactionsModal } from '../components/ImportTransactionsModal';
import { PageTransition } from '../../../core/ui/components/PageTransition';
import { useTransactionsSubscription } from '../hooks/useTransactionsSubscription';
import { categorizeTransactions } from '../../ai/services/geminiService';
import { categoryService } from '../../categories/services/CategoryService';
import { useQueryClient } from '@tanstack/react-query';

export function TransactionsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useTransactionsSubscription();

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

  const handleCategorize = async () => {
    if (!user) return;

    // Filter transactions that need categorization (No category or "Outros")
    const toCategorize = transactions.filter(
      (t) => !t.category_id || t.categories?.name === 'Outros' || t.categories?.name === 'Sem Categoria'
    );

    if (toCategorize.length === 0) {
      toast.info('Todas as suas transações já estão categorizadas!');
      return;
    }

    setIsCategorizing(true);
    const toastId = toast.loading('A IA está analisando suas transações...');

    try {
      // Get all categories from user
      const { data: categories } = await categoryService.getCategories(user.id);
      
      if (!categories || categories.length === 0) {
        toast.error('Você precisa ter categorias cadastradas.', { id: toastId });
        setIsCategorizing(false);
        return;
      }

      // Unique descriptions to save API tokens
      const uniqueDescriptions = Array.from(new Set(toCategorize.map((t) => t.description)));
      
      const mapping = await categorizeTransactions(
        uniqueDescriptions, 
        categories.map(c => ({ id: c.id, name: c.name }))
      );

      let updatedCount = 0;

      // Update transactions in the database
      const updatePromises = toCategorize.map(async (transaction) => {
        const suggestedCategoryId = mapping[transaction.description];
        if (suggestedCategoryId) {
          const { error } = await transactionService.updateTransactionCategory(
            user.id,
            transaction.id,
            suggestedCategoryId
          );
          if (!error) updatedCount++;
        }
      });

      await Promise.all(updatePromises);

      toast.success(`${updatedCount} transações categorizadas com sucesso!`, { id: toastId });
      
      // Refresh UI
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      loadTransactions();
      
    } catch (error) {
      toast.error('Erro ao categorizar transações. Tente novamente mais tarde.', { id: toastId });
    } finally {
      setIsCategorizing(false);
    }
  };

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
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button 
            variant="secondary" 
            onClick={handleCategorize} 
            disabled={isCategorizing || loading || transactions.length === 0}
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            {isCategorizing ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Categorizar com IA
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar OFX/CSV/PDF
          </Button>
          <Button variant="outline" onClick={() => setIsSyncModalOpen(true)}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Sincronizar Banco
          </Button>
          <Button onClick={() => navigate('/transactions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova transação
          </Button>
        </div>
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
      
      <BankSyncModal 
        open={isSyncModalOpen} 
        onOpenChange={setIsSyncModalOpen}
        onSyncComplete={loadTransactions}
      />

      <ImportTransactionsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </PageTransition>
  );
}

