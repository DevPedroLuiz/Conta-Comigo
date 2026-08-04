import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { TransactionFormData } from '../schemas/transaction.schemas';
import { TransactionForm } from '../components/TransactionForm';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function TransactionCreatePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    async function loadFormReferences() {
      if (!user) return;
      const { data, error } = await transactionService.getFormData(user.id);
      
      if (error) {
        toast.error('Erro ao carregar dados do formulário');
      } else if (data) {
        setAccounts(data.accounts || []);
        setCategories(data.categories || []);
      }
      setLoading(false);
    }
    
    loadFormReferences();
  }, [user?.id]);

  const handleSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    setSubmitting(true);
    
    const { error } = await transactionService.createTransaction(user.id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao criar transação');
    } else {
      toast.success('Transação criada com sucesso');
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
        <h2 className="text-3xl font-bold tracking-tight">Nova Transação</h2>
        <p className="text-muted-foreground">Preencha os detalhes da sua movimentação financeira.</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#0c0c0e] p-6">
        <TransactionForm 
          accounts={accounts} 
          categories={categories} 
          onSubmit={handleSubmit} 
          isLoading={submitting} 
        />
      </div>
    </div>
  );
}
