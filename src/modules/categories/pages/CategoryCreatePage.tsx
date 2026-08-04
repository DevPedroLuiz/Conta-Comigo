import { useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { categoryService } from '../services/CategoryService';
import { CategoryFormData } from '../schemas/category.schemas';
import { CategoryForm } from '../components/CategoryForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function CategoryCreatePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CategoryFormData) => {
    if (!user) return;
    setSubmitting(true);
    
    const { error } = await categoryService.createCategory(user.id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao criar categoria');
    } else {
      toast.success('Categoria criada com sucesso');
      navigate('/categories');
    }
    
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Nova Categoria</h2>
        <p className="text-muted-foreground">Crie uma nova categoria para organizar suas transações.</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#0c0c0e] p-6">
        <CategoryForm 
          onSubmit={handleSubmit} 
          isLoading={submitting} 
        />
      </div>
    </div>
  );
}
