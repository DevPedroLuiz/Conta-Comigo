import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { budgetService } from '../services/BudgetService';
import { BudgetFormData } from '../schemas/budget.schemas';
import { BudgetForm } from '../components/BudgetForm';

export function BudgetCreatePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BudgetFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    
    const { error: submitError } = await budgetService.createBudget(user.id, data);
    
    if (submitError) {
      setError(submitError.message || 'Erro ao criar orçamento.');
      setIsSubmitting(false);
      return;
    }
    
    navigate('/budgets');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/budgets')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Orçamento</h1>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-2xl bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <BudgetForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
