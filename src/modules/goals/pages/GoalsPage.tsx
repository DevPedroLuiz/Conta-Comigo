import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { goalService } from '../services/GoalService';
import { Goal } from '../types/goal.types';
import { Button } from '../../../core/ui/components/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoalList } from '../components/GoalList';
import { GoalEmptyState } from '../components/GoalEmptyState';
import { GoalAddProgressDialog } from '../components/GoalAddProgressDialog';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';

export function GoalsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isAddingProgress, setIsAddingProgress] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await goalService.getGoals(user.id);
    
    if (error) {
      toast.error('Erro ao carregar metas');
    } else if (data) {
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenProgressDialog = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsProgressDialogOpen(true);
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
    if (!user) return;
    setIsAddingProgress(true);
    
    const { error, data } = await goalService.addProgress(user.id, goalId, amount);
    
    if (error) {
      toast.error('Erro ao adicionar progresso');
    } else {
      if (data?.status === 'completed' && selectedGoal?.status === 'active') {
        toast.success('Parabéns! Você alcançou sua meta! 🎉');
      } else {
        toast.success('Progresso adicionado com sucesso');
      }
      setIsProgressDialogOpen(false);
      setSelectedGoal(null);
      loadData();
    }
    
    setIsAddingProgress(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Minhas Metas</h2>
        <Button onClick={() => navigate('/goals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <GoalEmptyState />
      ) : (
        <GoalList goals={goals} onAddProgress={handleOpenProgressDialog} />
      )}

      <GoalAddProgressDialog 
        goal={selectedGoal}
        isOpen={isProgressDialogOpen}
        onClose={() => {
          setIsProgressDialogOpen(false);
          setSelectedGoal(null);
        }}
        onSubmit={handleAddProgress}
        isLoading={isAddingProgress}
      />
    </div>
  );
}
