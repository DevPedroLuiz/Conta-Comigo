import { useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { accountService } from '../services/AccountService';
import { AccountFormData } from '../schemas/account.schemas';
import { AccountForm } from '../components/AccountForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function AccountCreatePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: AccountFormData) => {
    if (!user) return;
    setSubmitting(true);
    
    const { error } = await accountService.createAccount(user.id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada com sucesso');
      navigate('/accounts');
    }
    
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Nova Conta</h2>
        <p className="text-muted-foreground">Cadastre uma nova conta financeira para gerenciar seu dinheiro.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <AccountForm 
          onSubmit={handleSubmit} 
          isLoading={submitting} 
        />
      </div>
    </div>
  );
}
