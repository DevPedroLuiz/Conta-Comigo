import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Save, ArrowLeft } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { creditCardsService } from '../services/CreditCardsService';
import { creditCardSchema, CreditCardFormData } from '../schemas/credit-card.schemas';

export function CreditCardCreatePage() {
  const navigate = useNavigate();
  const user = useUser();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema) as any,
    defaultValues: {
      color: '#000000',
    },
  });

  const onSubmit = async (data: CreditCardFormData) => {
    setError('');
    if (!user) return;

    const { error } = await creditCardsService.createCreditCard(user.id, data);

    if (error) {
      setError('Erro ao criar cartão. Tente novamente.');
      return;
    }

    navigate('/credit-cards');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/credit-cards')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Cartão</h1>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-destructive/15 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Nome do Cartão</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="Ex: Nubank, Itaú Black"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="limit" className="text-sm font-medium">Limite (R$)</label>
              <input
                id="limit"
                type="number"
                step="0.01"
                {...register('limit')}
                className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="0.00"
              />
              {errors.limit && <p className="text-sm text-destructive">{errors.limit.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="brand" className="text-sm font-medium">Bandeira (Opcional)</label>
              <input
                id="brand"
                type="text"
                {...register('brand')}
                className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="Ex: Mastercard, Visa"
              />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="closing_day" className="text-sm font-medium">Dia de Fechamento</label>
              <input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                {...register('closing_day')}
                className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              {errors.closing_day && <p className="text-sm text-destructive">{errors.closing_day.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="due_day" className="text-sm font-medium">Dia de Vencimento</label>
              <input
                id="due_day"
                type="number"
                min="1"
                max="31"
                {...register('due_day')}
                className="w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
              {errors.due_day && <p className="text-sm text-destructive">{errors.due_day.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="color" className="text-sm font-medium">Cor de Identificação</label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                {...register('color')}
                className="h-12 w-24 rounded-2xl cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">Utilizada para identificar o cartão nos relatórios.</span>
            </div>
            {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/credit-cards')}
              className="rounded-full px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
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
                  Salvar Cartão
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
