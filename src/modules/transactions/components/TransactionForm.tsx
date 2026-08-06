import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionFormData } from '../schemas/transaction.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Textarea } from '../../../core/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { RadioGroup, RadioGroupItem } from '../../../core/ui/components/radio-group';
import { ArrowDownCircle, ArrowUpCircle, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { suggestCategory } from '../utils/categoryMatcher';
import { useCreateTransaction } from '../hooks/useCreateTransaction';

interface TransactionFormProps {
  initialData?: TransactionFormData;
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string; type: string }[];
  creditCards?: { id: string; name: string }[];
  onSubmit?: (data: TransactionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TransactionForm({ 
  initialData, 
  accounts, 
  categories, 
  creditCards = [], 
  onSubmit, 
  onCancel,
  isLoading 
}: TransactionFormProps) {
  const [sourceType, setSourceType] = useState<'account' | 'credit_card'>(initialData?.credit_card_id ? 'credit_card' : 'account');
  const [aiSuggested, setAiSuggested] = useState(false);
  const { mutateAsync: createTransaction, isPending: isCreating } = useCreateTransaction();

  const isMutating = isLoading || isCreating;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema) as unknown as any,
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

  const handleFormSubmit = async (data: TransactionFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      await createTransaction(data);
      if (onCancel) onCancel(); // Fechar modal em caso de sucesso
    }
  };

  const inputStyles = "rounded-sm border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500";
  const errorStyles = "text-sm font-medium text-rose-500 dark:text-rose-400 mt-1";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-zinc-700 dark:text-zinc-300">Tipo de Transação</Label>
        <RadioGroup
          defaultValue={type}
          onValueChange={(val) => {
            setValue('type', val as 'INCOME' | 'EXPENSE');
            setValue('category_id', '');
            setAiSuggested(false);
            if (val === 'INCOME') handleSourceChange('account');
          }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <RadioGroupItem value="INCOME" id="income" className="peer sr-only" aria-label="Receita" />
            <Label
              htmlFor="income"
              className="flex flex-col items-center justify-between rounded-sm border border-zinc-200 dark:border-zinc-800 bg-transparent p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/20 cursor-pointer transition-colors"
            >
              <ArrowUpCircle className="mb-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Receita</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="EXPENSE" id="expense" className="peer sr-only" aria-label="Despesa" />
            <Label
              htmlFor="expense"
              className="flex flex-col items-center justify-between rounded-sm border border-zinc-200 dark:border-zinc-800 bg-transparent p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 peer-data-[state=checked]:border-rose-500 peer-data-[state=checked]:bg-rose-50 dark:peer-data-[state=checked]:bg-rose-950/20 cursor-pointer transition-colors"
            >
              <ArrowDownCircle className="mb-2 h-5 w-5 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Despesa</span>
            </Label>
          </div>
        </RadioGroup>
        {errors.type && <p className={errorStyles} role="alert">{errors.type.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-zinc-700 dark:text-zinc-300">Valor</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500 dark:text-zinc-400 font-medium">R$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              className={`pl-9 ${inputStyles}`}
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              {...register('amount')}
            />
          </div>
          {errors.amount && <p className={errorStyles} role="alert">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-zinc-700 dark:text-zinc-300">Data</Label>
          <Input
            id="date"
            type="date"
            className={inputStyles}
            aria-invalid={!!errors.date}
            {...register('date')}
          />
          {errors.date && <p className={errorStyles} role="alert">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300">Descrição</Label>
        <Input
          id="description"
          placeholder="Ex: Supermercado"
          className={inputStyles}
          aria-invalid={!!errors.description}
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
        {errors.description && <p className={errorStyles} role="alert">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-zinc-700 dark:text-zinc-300">Origem</Label>
          {type === 'EXPENSE' ? (
            <Select value={sourceType} onValueChange={handleSourceChange}>
              <SelectTrigger className={inputStyles} aria-label="Origem">
                <SelectValue placeholder="Conta ou Cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account">Conta Bancária</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value="account" disabled>
              <SelectTrigger className={inputStyles}>
                <SelectValue placeholder="Conta Bancária" />
              </SelectTrigger>
            </Select>
          )}
        </div>

        {sourceType === 'account' ? (
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300">Conta Bancária</Label>
            <Select 
              value={accountId} 
              onValueChange={(val) => setValue('account_id', val)}
            >
              <SelectTrigger className={inputStyles} aria-invalid={!!errors.account_id} aria-label="Conta bancária">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && <p className={errorStyles} role="alert">{errors.account_id.message}</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label className="text-zinc-700 dark:text-zinc-300">Cartão de Crédito</Label>
            <Select 
              value={creditCardId} 
              onValueChange={(val) => setValue('credit_card_id', val)}
            >
              <SelectTrigger className={inputStyles} aria-invalid={!!errors.credit_card_id} aria-label="Cartão de crédito">
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map(cc => (
                  <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.credit_card_id && <p className={errorStyles} role="alert">{errors.credit_card_id.message}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-zinc-700 dark:text-zinc-300">Categoria</Label>
            {aiSuggested && (
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
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
            <SelectTrigger className={inputStyles} aria-invalid={!!errors.category_id} aria-label="Categoria">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && <p className={errorStyles} role="alert">{errors.category_id.message}</p>}
        </div>
        
        {sourceType === 'credit_card' && (
          <div className="space-y-1.5">
            <Label htmlFor="installments" className="text-zinc-700 dark:text-zinc-300">Parcelas</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              placeholder="1"
              className={inputStyles}
              aria-invalid={!!errors.installments}
              {...register('installments')}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-zinc-700 dark:text-zinc-300">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Opcional"
          className={`min-h-[80px] resize-none ${inputStyles}`}
          {...register('notes')}
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isMutating}
            className="rounded-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isMutating}
          className="rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isMutating ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </form>
  );
}
