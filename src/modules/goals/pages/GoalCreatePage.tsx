import { useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { goalService } from '../services/GoalService';
import { GoalFormData } from '../schemas/goal.schemas';
import { GoalForm } from '../components/GoalForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function GoalCreatePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: GoalFormData) => {
    if (!user) return;
    setSubmitting(true);
    
    const { error } = await goalService.createGoal(user.id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao criar meta');
    } else {
      toast.success('Meta criada com sucesso');
      navigate('/goals');
    }
    
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Nova Meta</h2>
        <p className="text-zinc-400">Planeje seu próximo objetivo financeiro.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6">
        <GoalForm 
          onSubmit={handleSubmit} 
          isLoading={submitting} 
        />
      </div>
    </div>
  );
}
