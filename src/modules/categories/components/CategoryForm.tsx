import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '../schemas/category.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { useNavigate } from 'react-router-dom';
import { getCategoryIcon } from './CategoryCard';

interface CategoryFormProps {
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  isLoading: boolean;
}

const AVAILABLE_ICONS = ['tag', 'home', 'coffee', 'car', 'heart', 'smile', 'briefcase', 'trending-up'];
const AVAILABLE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#888888'];

export function CategoryForm({ initialData, onSubmit, isLoading }: CategoryFormProps) {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema as any),
    defaultValues: initialData || {
      name: '',
      type: 'EXPENSE',
      color: '#888888',
      icon: 'tag',
    }
  });

  const type = watch('type');
  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input
          id="name"
          placeholder="Ex: Alimentação, Transporte..."
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive dark:text-red-400">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select 
          value={type} 
          onValueChange={(val) => setValue('type', val as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Despesa</SelectItem>
            <SelectItem value="INCOME">Receita</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-destructive dark:text-red-400">{errors.type.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Ícone</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon)}
              className={`flex h-10 w-10 items-center justify-center rounded-md border ${
                selectedIcon === icon 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'border-border bg-background text-muted-foreground hover:bg-card'
              }`}
            >
              {getCategoryIcon(icon)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                selectedColor === color 
                  ? 'border-white' 
                  : 'border-transparent hover:scale-110 transition-transform'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/categories')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Categoria'}
        </Button>
      </div>
    </form>
  );
}
