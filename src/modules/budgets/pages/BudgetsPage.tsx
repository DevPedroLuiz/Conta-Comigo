import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Target } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { budgetService } from '../services/BudgetService';
import { Budget } from '../types/budget.types';
import { Progress } from '../../../core/ui/components/progress';

export function BudgetsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user, month, year]);

  const loadBudgets = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await budgetService.getBudgetsWithSpent(user.id, month, year);
    if (data) setBudgets(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">Controle seus gastos por categoria.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="month" 
            value={`${year}-${month.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-');
              setYear(parseInt(y));
              setMonth(parseInt(m));
            }}
            className="rounded-full border border-input bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => navigate('/budgets/new')}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum orçamento neste mês</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Crie limites de gastos para suas categorias e acompanhe o quanto você já gastou.
          </p>
          <button
            onClick={() => navigate('/budgets/new')}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Criar Orçamento
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const spent = budget.spent_amount || 0;
            const percentage = Math.min(100, Math.max(0, (spent / budget.limit_amount) * 100));
            const isOver = spent > budget.limit_amount;
            
            return (
              <div 
                key={budget.id} 
                className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/budgets/${budget.id}/edit`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: budget.categories?.color || '#ccc' }}
                    >
                      <span className="text-lg">{budget.categories?.icon || '📝'}</span>
                    </div>
                    <span className="font-semibold">{budget.categories?.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className={isOver ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-medium">
                      R$ {budget.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    indicatorColor={isOver ? 'bg-destructive' : percentage > 80 ? 'bg-orange-500' : 'bg-primary'}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
