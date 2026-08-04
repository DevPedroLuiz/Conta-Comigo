import { Goal } from '../types/goal.types';
import { GoalCard } from './GoalCard';

interface GoalListProps {
  goals: Goal[];
  onAddProgress?: (goal: Goal) => void;
}

export function GoalList({ goals, onAddProgress }: GoalListProps) {
  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const cancelled = goals.filter(g => g.status === 'cancelled');

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-primary uppercase tracking-wider">Metas Ativas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(goal => (
              <GoalCard key={goal.id} goal={goal} onAddProgress={onAddProgress} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Metas Concluídas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-75">
            {completed.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {cancelled.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Metas Canceladas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-50">
            {cancelled.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
