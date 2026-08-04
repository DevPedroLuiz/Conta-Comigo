import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { goalService } from '../services/GoalService';
import { GoalFormData } from '../schemas/goal.schemas';
import { GoalForm } from '../components/GoalForm';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export function GoalEditPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<GoalFormData | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      
      const { data, error } = await goalService.getGoalById(user.id, id);
      
      if (error || !data) {
        toast.error('Erro ao carregar os dados da meta');
        navigate('/goals');
      } else {
        setInitialData({
          name: data.name,
          description: data.description || '',
          target_amount: data.target_amount,
          current_amount: data.current_amount,
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
          status: data.status,
        });
      }
      setLoading(false);
    }
    
    loadData();
  }, [user?.id, id, navigate]);

  const handleSubmit = async (data: GoalFormData) => {
    if (!user || !id) return;
    setSubmitting(true);
    
    const { error } = await goalService.updateGoal(user.id, id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao atualizar meta');
    } else {
      toast.success('Meta atualizada com sucesso');
      navigate('/goals');
    }
    
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !id) return;
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      const { error } = await goalService.deleteGoal(user.id, id);
      if (error) {
        toast.error(error.message || 'Erro ao excluir meta');
      } else {
        toast.success('Meta excluída com sucesso');
        navigate('/goals');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Editar Meta</h2>
        <p className="text-zinc-400">Atualize as informações da sua meta.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6">
        {initialData && (
          <GoalForm 
            initialData={initialData}
            onSubmit={handleSubmit} 
            isLoading={submitting} 
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
