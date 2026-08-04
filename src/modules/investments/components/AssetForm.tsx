import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema, AssetFormData } from '../schemas/investment.schemas';
import { Investment } from '../types/investment.types';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { useNavigate } from 'react-router-dom';

interface AssetFormProps {
  investments: Investment[];
  onSubmit: (data: AssetFormData) => Promise<void>;
  isLoading: boolean;
}

export function AssetForm({ investments, onSubmit, isLoading }: AssetFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema as any),
    defaultValues: {
      investment_id: '',
      ticker: '',
      name: '',
      type: undefined,
    }
  });

  const type = watch('type');
  const investmentId = watch('investment_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Carteira/Corretora *</Label>
          <Select 
            value={investmentId} 
            onValueChange={(val) => setValue('investment_id', val)} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a corretora" />
            </SelectTrigger>
            <SelectContent>
              {investments.map(inv => (
                <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.investment_id && <p className="text-sm text-destructive dark:text-red-400">{errors.investment_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker (Código) *</Label>
            <Input
              id="ticker"
              placeholder="Ex: AAPL34, PETR4"
              {...register('ticker')}
              onChange={(e) => {
                setValue('ticker', e.target.value.toUpperCase());
              }}
            />
            {errors.ticker && <p className="text-sm text-destructive dark:text-red-400">{errors.ticker.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Ativo *</Label>
            <Select value={type} onValueChange={(val) => setValue('type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Ações</SelectItem>
                <SelectItem value="FII">Fundos Imobiliários</SelectItem>
                <SelectItem value="ETF">ETFs</SelectItem>
                <SelectItem value="CRYPTO">Criptomoedas</SelectItem>
                <SelectItem value="FIXED_INCOME">Renda Fixa</SelectItem>
                <SelectItem value="TREASURY">Tesouro Direto</SelectItem>
                <SelectItem value="OTHER">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive dark:text-red-400">{errors.type.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome da Empresa/Ativo *</Label>
          <Input
            id="name"
            placeholder="Ex: Apple Inc, Petrobras"
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive dark:text-red-400">{errors.name.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate('/investments')} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || investments.length === 0}>
          {isLoading ? 'Salvando...' : 'Cadastrar Ativo'}
        </Button>
      </div>
    </form>
  );
}
