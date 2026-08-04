import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { Investment } from '../types/investment.types';
import { AssetForm } from '../components/AssetForm';
import { AssetFormData } from '../schemas/investment.schemas';
import { Button } from '../../../core/ui/components/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function AssetCreatePage() {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    if (user) {
      investmentService.getInvestments(user.id).then((res) => {
        if (res.data) setInvestments(res.data);
      });
    }
  }, [user]);

  const handleSubmit = async (data: AssetFormData) => {
    setLoading(true);
    const { error, data: createdData } = await investmentService.createAsset(user!.id, data);
    setLoading(false);

    if (error) {
      toast.error('Erro ao cadastrar ativo');
    } else {
      toast.success('Ativo cadastrado com sucesso');
      navigate(`/investments/assets/${createdData?.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Ativo</h1>
          <p className="text-muted-foreground mt-1">
            Cadastre um novo ativo financeiro na sua carteira
          </p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border">
        <AssetForm investments={investments} onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
