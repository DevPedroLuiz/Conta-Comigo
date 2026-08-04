import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { budgetService } from '../services/BudgetService';
import { BudgetFormData } from '../schemas/budget.schemas';
import { BudgetForm } from '../components/BudgetForm';
import { Budget } from '../types/budget.types';

export function BudgetEditPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      budgetService.getBudgetById(user.id, id).then(({ data }) => {
        if (data) setBudget(data);
        setLoading(false);
      });
    }
  }, [user, id]);

  const handleSubmit = async (data: BudgetFormData) => {
    if (!user || !id) return;
    setIsSubmitting(true);
    setError(null);
    
    const { error: submitError } = await budgetService.updateBudget(user.id, id, data);
    
    if (submitError) {
      setError(submitError.message || 'Erro ao atualizar orçamento.');
      setIsSubmitting(false);
      return;
    }
    
    navigate('/budgets');
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;
    
    await budgetService.deleteBudget(user.id, id);
    navigate('/budgets');
  };

  if (loading) return <div>Carregando...</div>;
  if (!budget) return <div>Orçamento não encontrado.</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/budgets')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Orçamento</h1>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-2xl bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <BudgetForm 
          initialData={budget}
          onSubmit={handleSubmit} 
          onDelete={handleDelete}
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
