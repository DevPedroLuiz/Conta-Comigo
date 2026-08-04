import { Category } from '../types/category.types';
import { CategoryCard } from './CategoryCard';

interface CategoryListProps {
  categories: Category[];
  onDelete: (id: string) => void;
}

export function CategoryList({ categories, onDelete }: CategoryListProps) {
  const incomes = categories.filter(c => c.type === 'INCOME');
  const expenses = categories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="space-y-8">
      {incomes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Receitas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {incomes.map(category => (
              <CategoryCard key={category.id} category={category} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-destructive uppercase tracking-wider">Despesas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenses.map(category => (
              <CategoryCard key={category.id} category={category} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
