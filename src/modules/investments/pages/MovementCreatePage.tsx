import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { accountService } from '../../accounts/services/AccountService';
import { Account } from '../../accounts/types/account.types';
import { MovementForm } from '../components/MovementForm';
import { MovementFormData } from '../schemas/investment.schemas';
import { Button } from '../../../core/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function MovementCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (user) {
      accountService.getAccounts(user.id).then((res) => {
        if (res.data) setAccounts(res.data);
      });
    }
  }, [user]);

  const handleSubmit = async (data: MovementFormData) => {
    if (!id) return;
    
    setLoading(true);
    const { error } = await investmentService.createMovement(user!.id, id, data);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Erro ao registrar movimentação');
    } else {
      toast.success('Ordem registrada com sucesso');
      navigate(`/investments/assets/${id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/investments/assets/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançar Ordem</h1>
          <p className="text-muted-foreground mt-1">
            Registre uma compra ou venda de ativo
          </p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        {id && <MovementForm assetId={id} accounts={accounts} onSubmit={handleSubmit} isLoading={loading} />}
      </div>
    </div>
  );
}
