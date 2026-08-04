import { EmptyState } from '../../../core/ui/components/empty-state';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../core/ui/components/button';

export function GoalEmptyState() {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={<Target className="h-10 w-10 text-muted-foreground" />}
      title="Nenhuma meta encontrada"
      description="Comece a planejar o seu futuro. Crie metas financeiras e acompanhe o seu progresso."
      action={
        <Button onClick={() => navigate('/goals/new')}>
          Criar Nova Meta
        </Button>
      }
    />
  );
}
