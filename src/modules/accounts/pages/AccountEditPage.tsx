import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { accountService } from '../services/AccountService';
import { AccountFormData } from '../schemas/account.schemas';
import { AccountForm } from '../components/AccountForm';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export function AccountEditPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<AccountFormData | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      
      const { data, error } = await accountService.getAccountById(user.id, id);
      
      if (error) {
        toast.error('Erro ao carregar os dados da conta');
        navigate('/accounts');
      } else if (data) {
        setInitialData({
          name: data.name,
          type: data.type,
          initial_balance: data.initial_balance,
          currency: data.currency,
        });
      }
      setLoading(false);
    }
    
    loadData();
  }, [user, id, navigate]);

  const handleSubmit = async (data: AccountFormData) => {
    if (!user || !id) return;
    setSubmitting(true);
    
    const { error } = await accountService.updateAccount(user.id, id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao atualizar conta');
    } else {
      toast.success('Conta atualizada com sucesso');
      navigate('/accounts');
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
        <h2 className="text-3xl font-bold tracking-tight">Editar Conta</h2>
        <p className="text-muted-foreground">Atualize as informações da sua conta financeira.</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#0c0c0e] p-6">
        {initialData && (
          <AccountForm 
            initialData={initialData}
            onSubmit={handleSubmit} 
            isLoading={submitting} 
          />
        )}
      </div>
    </div>
  );
}
