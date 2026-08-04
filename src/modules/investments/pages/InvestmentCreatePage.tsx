import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { InvestmentForm } from '../components/InvestmentForm';
import { InvestmentFormData } from '../schemas/investment.schemas';
import { Button } from '../../../core/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function InvestmentCreatePage() {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: InvestmentFormData) => {
    setLoading(true);
    const { error } = await investmentService.createInvestment(user!.id, data);
    setLoading(false);

    if (error) {
      toast.error('Erro ao cadastrar carteira');
    } else {
      toast.success('Carteira cadastrada com sucesso');
      navigate('/investments');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Carteira de Investimento</h1>
          <p className="text-muted-foreground mt-1">
            Cadastre uma corretora ou instituição financeira
          </p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        <InvestmentForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
