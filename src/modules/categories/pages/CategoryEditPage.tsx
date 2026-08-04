import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { categoryService } from '../services/CategoryService';
import { CategoryFormData } from '../schemas/category.schemas';
import { CategoryForm } from '../components/CategoryForm';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

export function CategoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<CategoryFormData | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      
      const { data, error } = await categoryService.getCategoryById(user.id, id);
      
      if (error) {
        toast.error('Erro ao carregar os dados da categoria');
        navigate('/categories');
      } else if (data) {
        if (data.is_default) {
          toast.error('Não é possível editar uma categoria padrão');
          navigate('/categories');
          return;
        }
        setInitialData({
          name: data.name,
          type: data.type,
          color: data.color || undefined,
          icon: data.icon || undefined,
        });
      }
      setLoading(false);
    }
    
    loadData();
  }, [user?.id, id, navigate]);

  const handleSubmit = async (data: CategoryFormData) => {
    if (!user || !id) return;
    setSubmitting(true);
    
    const { error } = await categoryService.updateCategory(user.id, id, data);
    
    if (error) {
      toast.error(error.message || 'Erro ao atualizar categoria');
    } else {
      toast.success('Categoria atualizada com sucesso');
      navigate('/categories');
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex h-[30vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Editar Categoria</h2>
        <p className="text-muted-foreground">Atualize as informações desta categoria.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        {initialData && (
          <CategoryForm 
            initialData={initialData}
            onSubmit={handleSubmit} 
            isLoading={submitting} 
          />
        )}
      </div>
    </div>
  );
}
