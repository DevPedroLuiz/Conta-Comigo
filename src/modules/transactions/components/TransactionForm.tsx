import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../schemas/transaction.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Textarea } from '../../../core/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { RadioGroup, RadioGroupItem } from '../../../core/ui/components/radio-group';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionFormProps {
  initialData?: TransactionFormData;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading: boolean;
}

export function TransactionForm({ initialData, accounts, categories, onSubmit, isLoading }: TransactionFormProps) {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: initialData || {
      type: 'EXPENSE',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    }
  });

  const type = watch('type');
  const accountId = watch('account_id');
  const categoryId = watch('category_id');

  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type || !c.type);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label>Tipo de Transação</Label>
        <RadioGroup
          defaultValue={type}
          onValueChange={(val) => {
            setValue('type', val as 'INCOME' | 'EXPENSE');
            setValue('category_id', ''); // reset category on type change
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="INCOME" id="income" className="peer sr-only" />
            <Label
              htmlFor="income"
              className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-800 bg-transparent p-4 hover:bg-zinc-800/50 hover:text-zinc-100 peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer"
            >
              <ArrowUpCircle className="mb-3 h-6 w-6 text-emerald-500" />
              Receita
            </Label>
          </div>
          <div>
            <RadioGroupItem value="EXPENSE" id="expense" className="peer sr-only" />
            <Label
              htmlFor="expense"
              className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-800 bg-transparent p-4 hover:bg-zinc-800/50 hover:text-zinc-100 peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive cursor-pointer"
            >
              <ArrowDownCircle className="mb-3 h-6 w-6 text-destructive" />
              Despesa
            </Label>
          </div>
        </RadioGroup>
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500">R$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              className="pl-9"
              placeholder="0,00"
              {...register('amount')}
            />
          </div>
          {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Supermercado"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Conta</Label>
          <Select 
            value={accountId} 
            onValueChange={(val) => setValue('account_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.account_id && <p className="text-sm text-destructive">{errors.account_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select 
            value={categoryId} 
            onValueChange={(val) => setValue('category_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Opcional"
          {...register('notes')}
        />
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/transactions')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </form>
  );
}
