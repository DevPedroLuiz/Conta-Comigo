import { EmptyState } from '../../../core/ui/components/empty-state';
import { Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../core/ui/components/button';

export function CategoryEmptyState() {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={<Tags className="h-10 w-10 text-muted-foreground" />}
      title="Nenhuma categoria encontrada"
      description="Você ainda não cadastrou nenhuma categoria financeira personalizada."
      action={
        <Button onClick={() => navigate('/categories/new')}>
          Nova Categoria
        </Button>
      }
    />
  );
}
