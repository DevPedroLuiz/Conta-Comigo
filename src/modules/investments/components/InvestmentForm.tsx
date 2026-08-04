import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { investmentSchema, InvestmentFormData } from '../schemas/investment.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Textarea } from '../../../core/ui/components/textarea';
import { useNavigate } from 'react-router-dom';

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  isLoading: boolean;
}

export function InvestmentForm({ onSubmit, isLoading }: InvestmentFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema as any),
    defaultValues: {
      name: '',
      broker: '',
      description: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Carteira *</Label>
          <Input
            id="name"
            placeholder="Ex: Minha Aposentadoria, XP Investimentos"
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive dark:text-red-400">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="broker">Instituição (Corretora/Banco) *</Label>
          <Input
            id="broker"
            placeholder="Ex: XP, BTG, Nubank, Binance"
            {...register('broker')}
          />
          {errors.broker && <p className="text-sm text-destructive dark:text-red-400">{errors.broker.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (Opcional)</Label>
          <Textarea
            id="description"
            placeholder="Objetivo dessa carteira..."
            rows={3}
            {...register('description')}
          />
          {errors.description && <p className="text-sm text-destructive dark:text-red-400">{errors.description.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate('/investments')} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Carteira'}
        </Button>
      </div>
    </form>
  );
}
