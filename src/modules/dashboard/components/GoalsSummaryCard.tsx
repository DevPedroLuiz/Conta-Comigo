import { GoalsSummary } from '../../goals/types/goal.types';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../core/ui/components/button';
import { GoalProgress } from '../../goals/components/GoalProgress';

interface GoalsSummaryCardProps {
  summary: GoalsSummary | null | undefined;
}

export function GoalsSummaryCard({ summary }: GoalsSummaryCardProps) {
  const navigate = useNavigate();

  if (!summary || summary.activeGoals === 0) {
    return (
      <div className="flex flex-col p-6 rounded-xl border border-border bg-card gap-4 h-full">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Metas Financeiras</h3>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-2">
          <p className="text-sm text-muted-foreground">Você ainda não possui metas ativas.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/goals/new')}>
            Criar Meta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-xl border border-border bg-card gap-4 h-full relative group hover:border-border transition-colors cursor-pointer" onClick={() => navigate('/goals')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Metas Financeiras</h3>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex justify-between items-baseline pt-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Metas Ativas</span>
          <span className="text-2xl font-bold tracking-tight text-foreground">{summary.activeGoals}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Progresso Médio</span>
          <span className="text-xl font-medium text-emerald-600 dark:text-emerald-400">{summary.averageProgress.toFixed(1)}%</span>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 mt-auto">
        <p className="text-xs text-muted-foreground mb-2">Próxima meta a vencer:</p>
        {summary.nextToExpire ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground truncate">{summary.nextToExpire.name}</p>
            <GoalProgress current={Number(summary.nextToExpire.current_amount)} target={Number(summary.nextToExpire.target_amount)} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma meta com prazo definido.</p>
        )}
      </div>
    </div>
  );
}
