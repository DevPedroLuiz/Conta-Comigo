import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../schemas/transaction.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Textarea } from '../../../core/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { RadioGroup, RadioGroupItem } from '../../../core/ui/components/radio-group';
import { ArrowDownCircle, ArrowUpCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { suggestCategory } from '../utils/categoryMatcher';

interface TransactionFormProps {
  initialData?: TransactionFormData;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
  creditCards?: { id: string; name: string }[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  isLoading: boolean;
}

export function TransactionForm({ initialData, accounts, categories, creditCards = [], onSubmit, isLoading }: TransactionFormProps) {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<'account' | 'credit_card'>(initialData?.credit_card_id ? 'credit_card' : 'account');
  const [aiSuggested, setAiSuggested] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      type: 'EXPENSE',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'PAID',
    }
  });

  const type = watch('type');
  const accountId = watch('account_id');
  const categoryId = watch('category_id');
  const creditCardId = watch('credit_card_id');
  
  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type || !c.type);

  const handleSourceChange = (val: 'account' | 'credit_card') => {
    setSourceType(val);
    if (val === 'account') {
      setValue('credit_card_id', undefined);
      setValue('status', 'PAID');
    } else {
      setValue('account_id', undefined);
      setValue('status', 'UNPAID');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label>Tipo de Transação</Label>
        <RadioGroup
          defaultValue={type}
          onValueChange={(val) => {
            setValue('type', val as 'INCOME' | 'EXPENSE');
            setValue('category_id', ''); // reset category on type change
            setAiSuggested(false);
            if (val === 'INCOME') handleSourceChange('account');
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="INCOME" id="income" className="peer sr-only" />
            <Label
              htmlFor="income"
              className="flex flex-col items-center justify-between rounded-md border-2 border-border bg-transparent p-4 hover:bg-muted/50 hover:text-muted-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 cursor-pointer"
            >
              <ArrowUpCircle className="mb-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Receita
            </Label>
          </div>
          <div>
            <RadioGroupItem value="EXPENSE" id="expense" className="peer sr-only" />
            <Label
              htmlFor="expense"
              className="flex flex-col items-center justify-between rounded-md border-2 border-border bg-transparent p-4 hover:bg-muted/50 hover:text-muted-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive cursor-pointer"
            >
              <ArrowDownCircle className="mb-3 h-6 w-6 text-destructive dark:text-red-400" />
              Despesa
            </Label>
          </div>
        </RadioGroup>
        {errors.type && <p className="text-sm text-destructive dark:text-red-400">{errors.type.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              className="pl-9"
              placeholder="0,00"
              {...register('amount')}
            />
          </div>
          {errors.amount && <p className="text-sm text-destructive dark:text-red-400">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
          />
          {errors.date && <p className="text-sm text-destructive dark:text-red-400">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Supermercado"
          {...register('description')}
          onBlur={(e) => {
            const desc = e.target.value;
            if (desc && !categoryId) {
              const suggestedId = suggestCategory(desc, filteredCategories);
              if (suggestedId) {
                setValue('category_id', suggestedId, { shouldValidate: true });
                setAiSuggested(true);
              }
            }
          }}
        />
        {errors.description && <p className="text-sm text-destructive dark:text-red-400">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Origem</Label>
          {type === 'EXPENSE' ? (
            <Select value={sourceType} onValueChange={handleSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Conta ou Cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account">Conta Bancária</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value="account" disabled>
              <SelectTrigger>
                <SelectValue placeholder="Conta Bancária" />
              </SelectTrigger>
            </Select>
          )}
        </div>

        {sourceType === 'account' ? (
          <div className="space-y-2">
            <Label>Conta Bancária</Label>
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
            {errors.account_id && <p className="text-sm text-destructive dark:text-red-400">{errors.account_id.message}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Cartão de Crédito</Label>
            <Select 
              value={creditCardId} 
              onValueChange={(val) => setValue('credit_card_id', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map(cc => (
                  <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.credit_card_id && <p className="text-sm text-destructive dark:text-red-400">{errors.credit_card_id.message}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categoria</Label>
            {aiSuggested && (
              <span className="flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                <Sparkles className="h-3 w-3" />
                Sugerida
              </span>
            )}
          </div>
          <Select 
            value={categoryId} 
            onValueChange={(val) => {
              setValue('category_id', val);
              setAiSuggested(false);
            }}
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
          {errors.category_id && <p className="text-sm text-destructive dark:text-red-400">{errors.category_id.message}</p>}
        </div>
        
        {sourceType === 'credit_card' && (
          <div className="space-y-2">
            <Label htmlFor="installments">Parcelas</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              placeholder="1"
              {...register('installments')}
            />
          </div>
        )}
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
