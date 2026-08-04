import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { categoryService } from '../services/CategoryService';
import { Category } from '../types/category.types';
import { Button } from '../../../core/ui/components/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryList } from '../components/CategoryList';
import { CategoryEmptyState } from '../components/CategoryEmptyState';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';

export function CategoriesPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await categoryService.getCategories(user.id);
    
    if (error) {
      toast.error('Erro ao carregar categorias');
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Tem certeza que deseja excluir esta categoria? As transações vinculadas poderão perder a referência.')) {
      const { error } = await categoryService.deleteCategory(user.id, id);
      if (error) {
        toast.error(error.message || 'Erro ao excluir categoria');
      } else {
        toast.success('Categoria excluída com sucesso');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
        <Button onClick={() => navigate('/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : categories.length === 0 ? (
        <CategoryEmptyState />
      ) : (
        <CategoryList categories={categories} onDelete={handleDelete} />
      )}
    </div>
  );
}
