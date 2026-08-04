import { cn } from '../../../core/utils';

interface GoalProgressProps {
  current: number;
  target: number;
  className?: string;
}

export function GoalProgress({ current, target, className }: GoalProgressProps) {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isCompleted = percentage >= 100;
  
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage.toFixed(0)}% concluído</span>
        <span>R$ {(target - current > 0 ? target - current : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} restantes</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-card">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompleted ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
