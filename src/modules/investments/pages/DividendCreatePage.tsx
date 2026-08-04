import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { accountService } from '../../accounts/services/AccountService';
import { Account } from '../../accounts/types/account.types';
import { DividendForm } from '../components/DividendForm';
import { DividendFormData } from '../schemas/investment.schemas';
import { Button } from '../../../core/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function DividendCreatePage() {
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

  const handleSubmit = async (data: DividendFormData) => {
    if (!id) return;

    setLoading(true);
    const { error } = await investmentService.createDividend(user!.id, id, data);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Erro ao registrar provento');
    } else {
      toast.success('Provento registrado com sucesso');
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
          <h1 className="text-2xl font-bold tracking-tight">Receber Provento</h1>
          <p className="text-muted-foreground mt-1">
            Registre o recebimento de dividendos ou JCP
          </p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        {id && <DividendForm assetId={id} accounts={accounts} onSubmit={handleSubmit} isLoading={loading} />}
      </div>
    </div>
  );
}
