import { Goal } from '../types/goal.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Target, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoalProgress } from './GoalProgress';
import { format } from 'date-fns';

interface GoalCardProps {
  key?: string | number;
  goal: Goal;
  onAddProgress?: (goal: Goal) => void;
}

export function GoalCard({ goal, onAddProgress }: GoalCardProps) {
  const navigate = useNavigate();
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);

  return (
    <div className="flex flex-col p-5 rounded-xl border border-border bg-card hover:border-border transition-colors gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
              {goal.name}
              {goal.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              {goal.status === 'cancelled' && <XCircle className="h-4 w-4 text-muted-foreground" />}
            </h3>
            {goal.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/goals/${goal.id}/edit`)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex justify-between items-baseline pt-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Acumulado</span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            R$ {current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Objetivo</span>
          <span className="text-sm font-medium text-muted-foreground">
            R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <GoalProgress current={current} target={target} />

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          {goal.deadline ? (
            <span>Prazo: {format(new Date(goal.deadline), 'MM/yyyy')}</span>
          ) : (
            <span>Sem prazo definido</span>
          )}
        </div>
        {goal.status === 'active' && onAddProgress && (
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs font-medium border-border hover:bg-card"
            onClick={() => onAddProgress(goal)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Atualizar
          </Button>
        )}
      </div>
    </div>
  );
}
