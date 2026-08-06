import { useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { Transaction, TransactionType } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Plus, Upload, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TransactionList } from '../components/TransactionList';
import { TransactionFilters } from '../components/TransactionFilters';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { BankSyncModal } from '../../open-finance/components/BankSyncModal';
import { ImportTransactionsModal } from '../components/ImportTransactionsModal';
import { PageTransition } from '../../../core/ui/components/PageTransition';
import { AnimatedInteraction } from '../../../core/ui/components/AnimatedInteraction';
import { useTransactionsSubscription } from '../hooks/useTransactionsSubscription';
import { categorizeTransactions } from '../../ai/services/geminiService';
import { categoryService } from '../../categories/services/CategoryService';
import { accountService } from '../../accounts/services/AccountService';
import { creditCardsService } from '../../credit-cards/services/CreditCardsService';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useTransactions } from '../hooks/useTransactions';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../core/ui/components/dialog';
import { TransactionForm } from '../components/TransactionForm';

export function TransactionsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for filters
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Deriving filter boundaries for React Query
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  // Using TanStack Query for reactive and cached fetching
  const { data: transactions = [], isLoading, refetch } = useTransactions({
    userId: user?.id || '',
    type: filterType === 'ALL' ? undefined : filterType,
    startDate,
    endDate
  });

  // Queries para o formulário
  const { data: accountsData } = useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: () => accountService.getAccounts(user!.id),
    enabled: !!user,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: () => categoryService.getCategories(user!.id),
    enabled: !!user,
  });

  const { data: creditCardsData } = useQuery({
    queryKey: ['credit-cards', user?.id],
    queryFn: () => creditCardsService.getCreditCards(user!.id),
    enabled: !!user,
  });

  useTransactionsSubscription();

  const handleCategorize = async () => {
    if (!user) return;

    const toCategorize = transactions.filter(
      (t) => !t.category_id || t.category_id === null || String(t.category_id) === 'null' || t.categories?.name === 'Outros' || t.categories?.name === 'Sem Categoria'
    );

    if (toCategorize.length === 0) {
      toast.info('Todas as suas transações já estão categorizadas!');
      return;
    }

    setIsCategorizing(true);
    const toastId = toast.loading('A IA está analisando suas transações...');

    try {
      const { data: categories } = await categoryService.getCategories(user.id);
      
      if (!categories || categories.length === 0) {
        toast.error('Você precisa ter categorias cadastradas.', { id: toastId });
        setIsCategorizing(false);
        return;
      }

      const uniqueDescriptions: string[] = Array.from(new Set(toCategorize.map((t) => t.description)));
      
      const mapping = await categorizeTransactions(
        uniqueDescriptions, 
        categories.map(c => ({ id: c.id, name: c.name }))
      );

      let updatedCount = 0;

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
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error) {
      toast.error('Erro ao categorizar transações. Tente novamente.', { id: toastId });
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
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    }
  };

  const handleEdit = (tx: Transaction) => {
    navigate(`/transactions/${tx.id}/edit`);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Transações</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AnimatedInteraction>
            <Button 
              variant="secondary" 
              onClick={handleCategorize} 
              disabled={isCategorizing || isLoading || transactions.length === 0}
              className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              {isCategorizing ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Categorizar com IA
            </Button>
          </AnimatedInteraction>
          <AnimatedInteraction>
            <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800" onClick={() => setIsImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </AnimatedInteraction>
          <AnimatedInteraction>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsFormModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova transação
            </Button>
          </AnimatedInteraction>
        </div>
      </div>

      <TransactionFilters 
        type={filterType} 
        onChangeType={setFilterType}
        currentDate={currentDate}
        onChangeDate={setCurrentDate} 
      />

      <TransactionList 
        transactions={transactions} 
        isLoading={isLoading} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      
      <BankSyncModal 
        open={isSyncModalOpen} 
        onOpenChange={setIsSyncModalOpen}
        onSyncComplete={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
      />

      <ImportTransactionsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-zinc-200 dark:border-zinc-800 rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm 
            accounts={accountsData?.data || []}
            categories={categoriesData?.data || []}
            creditCards={creditCardsData?.data || []}
            onCancel={() => setIsFormModalOpen(false)}
            onSubmit={async (data) => {
              const result = await transactionService.createTransaction(user!.id, data);
              if (result.error) {
                toast.error(result.error.message);
              } else {
                toast.success('Transação criada com sucesso!');
                setIsFormModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
