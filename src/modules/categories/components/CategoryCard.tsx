import { Category } from '../types/category.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Trash2, Tag, Coffee, Home, Car, Heart, Smile, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  key?: string | number;
  category: Category;
  onDelete: (id: string) => void;
}

export const getCategoryIcon = (iconName?: string | null) => {
  switch (iconName) {
    case 'home': return <Home className="h-4 w-4" />;
    case 'coffee': return <Coffee className="h-4 w-4" />;
    case 'car': return <Car className="h-4 w-4" />;
    case 'heart': return <Heart className="h-4 w-4" />;
    case 'smile': return <Smile className="h-4 w-4" />;
    case 'briefcase': return <Briefcase className="h-4 w-4" />;
    case 'trending-up': return <TrendingUp className="h-4 w-4" />;
    case 'tag':
    default: return <Tag className="h-4 w-4" />;
  }
};

export function CategoryCard({ category, onDelete }: CategoryCardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-[#0c0c0e] hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center justify-center h-10 w-10 rounded-full"
          style={{ backgroundColor: `${category.color || '#888888'}20`, color: category.color || '#888888' }}
        >
          {getCategoryIcon(category.icon)}
        </div>
        <div>
          <h3 className="font-medium text-zinc-100 flex items-center gap-2">
            {category.name}
            {category.is_default && (
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-medium tracking-wide">PADRÃO</span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {category.type === 'INCOME' ? 'Receita' : 'Despesa'}
          </p>
        </div>
      </div>
      
      {!category.is_default && (
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-white"
            onClick={() => navigate(`/categories/${category.id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-zinc-400 hover:text-destructive"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
