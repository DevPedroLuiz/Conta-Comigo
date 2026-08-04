import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { movementSchema, MovementFormData } from '../schemas/investment.schemas';
import { Account } from '../../accounts/types/account.types';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { RadioGroup, RadioGroupItem } from '../../../core/ui/components/radio-group';
import { useNavigate } from 'react-router-dom';

interface MovementFormProps {
  assetId: string;
  accounts: Account[];
  onSubmit: (data: MovementFormData) => Promise<void>;
  isLoading: boolean;
}

export function MovementForm({ assetId, accounts, onSubmit, isLoading }: MovementFormProps) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema as any),
    defaultValues: {
      type: 'BUY',
      account_id: '',
      quantity: 0,
      price: 0,
      date: new Date().toISOString().split('T')[0],
    }
  });

  const type = watch('type');
  const accountId = watch('account_id');
  const quantity = watch('quantity');
  const price = watch('price');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tipo de Operação *</Label>
          <RadioGroup 
            value={type} 
            onValueChange={(val) => setValue('type', val)} 
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer">
              <RadioGroupItem value="BUY" id="buy" />
              <Label htmlFor="buy" className="cursor-pointer font-medium text-blue-600">COMPRA</Label>
            </div>
            <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 cursor-pointer">
              <RadioGroupItem value="SELL" id="sell" />
              <Label htmlFor="sell" className="cursor-pointer font-medium text-orange-600">VENDA</Label>
            </div>
          </RadioGroup>
          {errors.type && <p className="text-sm text-destructive dark:text-red-400">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Conta Bancária (Origem/Destino do dinheiro) *</Label>
          <Select 
            value={accountId} 
            onValueChange={(val) => setValue('account_id', val)}
          >
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.000001"
              min="0.000001"
              placeholder="Ex: 100"
              {...register('quantity')}
            />
            {errors.quantity && <p className="text-sm text-destructive dark:text-red-400">{errors.quantity.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Preço Unitário (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 35.50"
              {...register('price')}
            />
            {errors.price && <p className="text-sm text-destructive dark:text-red-400">{errors.price.message}</p>}
          </div>
        </div>
        
        {quantity > 0 && price >= 0 && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm font-medium">Valor Total da Ordem:</p>
            <p className="text-lg font-bold">R$ {(Number(quantity) * Number(price)).toFixed(2)}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="date">Data da Operação *</Label>
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
          {isLoading ? 'Salvando...' : 'Salvar Ordem'}
        </Button>
      </div>
    </form>
  );
}
