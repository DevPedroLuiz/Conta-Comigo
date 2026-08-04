import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { TransactionFormData } from '../schemas/transaction.schemas';
import { TransactionForm } from '../components/TransactionForm';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Transaction } from '../types/transaction.types';

export function TransactionEditPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<TransactionFormData | null>(null);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      
      const [{ data: refs, error: refError }, { data: tx, error: txError }] = await Promise.all([
        transactionService.getFormData(user.id),
        transactionService.getTransactionById(user.id, id)
      ]);
      
      if (refError || txError) {
        toast.error('Erro ao carregar os dados da transação');
        navigate('/transactions');
      } else if (refs && tx) {
        setAccounts(refs.accounts || []);
        setCategories(refs.categories || []);
        
        setInitialData({
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          date: tx.date,
          account_id: tx.account_id,
          category_id: tx.category_id,
          notes: tx.notes || '',
        });
      }
      setLoading(false);
    }
    
    loadData();
  }, [user, id, navigate]);

  const handleSubmit = async (data: TransactionFormData) => {
    if (!user || !id) return;
    setSubmitting(true);
    
    const { error } = await transactionService.updateTransaction(user.id, id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao atualizar transação');
    } else {
      toast.success('Transação atualizada com sucesso');
      navigate('/transactions');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Editar Transação</h2>
        <p className="text-muted-foreground">Atualize os detalhes da sua movimentação financeira.</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#0c0c0e] p-6">
        {initialData && (
          <TransactionForm 
            initialData={initialData}
            accounts={accounts} 
            categories={categories} 
            onSubmit={handleSubmit} 
            isLoading={submitting} 
          />
        )}
      </div>
    </div>
  );
}
