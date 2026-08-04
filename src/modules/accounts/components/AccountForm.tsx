import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, AccountFormData } from '../schemas/account.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { useNavigate } from 'react-router-dom';

interface AccountFormProps {
  initialData?: AccountFormData;
  onSubmit: (data: AccountFormData) => Promise<void>;
  isLoading: boolean;
}

export function AccountForm({ initialData, onSubmit, isLoading }: AccountFormProps) {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema as any),
    defaultValues: initialData || {
      name: '',
      type: 'CHECKING_ACCOUNT',
      initial_balance: 0,
      currency: 'BRL',
    }
  });

  const type = watch('type');
  const currency = watch('currency');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Conta</Label>
        <Input
          id="name"
          placeholder="Ex: Banco Inter, Carteira..."
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tipo de Conta</Label>
          <Select 
            value={type} 
            onValueChange={(val) => setValue('type', val as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CHECKING_ACCOUNT">Conta Corrente</SelectItem>
              <SelectItem value="SAVINGS_ACCOUNT">Conta Poupança</SelectItem>
              <SelectItem value="INVESTMENT">Investimento</SelectItem>
              <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
              <SelectItem value="CASH">Dinheiro/Carteira</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Moeda</Label>
          <Select 
            value={currency} 
            onValueChange={(val) => setValue('currency', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (BRL)</SelectItem>
              <SelectItem value="USD">Dólar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
          {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial_balance">Saldo Inicial</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-zinc-500">
            {currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€'}
          </span>
          <Input
            id="initial_balance"
            type="number"
            step="0.01"
            className="pl-10"
            placeholder="0,00"
            {...register('initial_balance')}
          />
        </div>
        {errors.initial_balance && <p className="text-sm text-destructive">{errors.initial_balance.message}</p>}
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/accounts')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Conta'}
        </Button>
      </div>
    </form>
  );
}
