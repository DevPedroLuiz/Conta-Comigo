import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dividendSchema, DividendFormData } from '../schemas/investment.schemas';
import { Account } from '../../accounts/types/account.types';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { useNavigate } from 'react-router-dom';

interface DividendFormProps {
  assetId: string;
  accounts: Account[];
  onSubmit: (data: DividendFormData) => Promise<void>;
  isLoading: boolean;
}

export function DividendForm({ assetId, accounts, onSubmit, isLoading }: DividendFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<DividendFormData>({
    resolver: zodResolver(dividendSchema as any),
    defaultValues: {
      account_id: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    }
  });

  const accountId = watch('account_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Conta Bancária (Destino) *</Label>
          <Select value={accountId} onValueChange={(val) => setValue('account_id', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name} (Saldo: R$ {acc.current_balance})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.account_id && <p className="text-sm text-destructive dark:text-red-400">{errors.account_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor Total (R$) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 50.00"
            {...register('amount')}
          />
          {errors.amount && <p className="text-sm text-destructive dark:text-red-400">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data do Pagamento *</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && <p className="text-sm text-destructive dark:text-red-400">{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(`/investments/assets/${assetId}`)} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || accounts.length === 0}>
          {isLoading ? 'Salvando...' : 'Registrar Provento'}
        </Button>
      </div>
    </form>
  );
}
