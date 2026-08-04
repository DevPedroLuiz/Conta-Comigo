import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2 } from 'lucide-react';
import { BudgetFormData, budgetSchema } from '../schemas/budget.schemas';
import { Budget } from '../types/budget.types';
import { referenceRepository } from '../../transactions/repositories/TransactionRepository';
import { useUser } from '../../auth/hooks/useAuth';

interface BudgetFormProps {
  initialData?: Budget;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function BudgetForm({ initialData, onSubmit, onDelete, isSubmitting }: BudgetFormProps) {
  const user = useUser();
  const [categories, setCategories] = useState<any[]>([]);

  const currentDate = new Date();
  const defaultMonth = initialData?.month || currentDate.getMonth() + 1;
  const defaultYear = initialData?.year || currentDate.getFullYear();
  const defaultMonthYear = `${defaultYear}-${defaultMonth.toString().padStart(2, '0')}`;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData & { monthYear: string }>({
    defaultValues: {
      category_id: initialData?.category_id || '',
      limit_amount: initialData?.limit_amount || undefined,
      monthYear: defaultMonthYear,
      month: defaultMonth,
      year: defaultYear
    } as any,
  });

  const monthYear = watch('monthYear');
  
  useEffect(() => {
    if (monthYear) {
      const [y, m] = monthYear.split('-');
      setValue('year', parseInt(y));
      setValue('month', parseInt(m));
    }
  }, [monthYear, setValue]);

  useEffect(() => {
    if (user) {
      referenceRepository.getCategories(user.id).then(cats => {
        // Only expense categories for budgets usually
        setCategories(cats.filter(c => c.type === 'EXPENSE'));
      });
    }
  }, [user]);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category_id" className="text-sm font-medium">Categoria</label>
          <select
            id="category_id"
            {...register('category_id')}
            className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            required
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="monthYear" className="text-sm font-medium">Mês/Ano</label>
          <input
            id="monthYear"
            type="month"
            {...register('monthYear')}
            className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            required
          />
          {errors.month && <p className="text-sm text-destructive">{errors.month.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="limit_amount" className="text-sm font-medium">Limite (R$)</label>
        <input
          id="limit_amount"
          type="number"
          step="0.01"
          {...register('limit_amount')}
          className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          placeholder="0.00"
          required
        />
        {errors.limit_amount && <p className="text-sm text-destructive">{errors.limit_amount.message}</p>}
      </div>

      <div className="pt-4 flex justify-between items-center">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </button>
        ) : <div />}
        
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Orçamento
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
