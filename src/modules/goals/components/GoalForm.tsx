import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, GoalFormData } from '../schemas/goal.schemas';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Textarea } from '../../../core/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { useNavigate } from 'react-router-dom';

interface GoalFormProps {
  initialData?: GoalFormData;
  onSubmit: (data: GoalFormData) => Promise<void>;
  isLoading: boolean;
  onDelete?: () => void;
}

export function GoalForm({ initialData, onSubmit, isLoading, onDelete }: GoalFormProps) {
  const navigate = useNavigate();
  const isEditing = !!initialData;

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: initialData || {
      name: '',
      description: '',
      target_amount: 0,
      current_amount: 0,
      deadline: '',
      status: 'active',
    }
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Meta</Label>
        <Input
          id="name"
          placeholder="Ex: Reserva de Emergência, Viagem para Paris..."
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Detalhes sobre a meta..."
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target_amount">Valor Objetivo</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500">R$</span>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              className="pl-9"
              placeholder="10000,00"
              {...register('target_amount')}
            />
          </div>
          {errors.target_amount && <p className="text-sm text-destructive">{errors.target_amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_amount">Valor Inicial/Atual</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-500">R$</span>
            <Input
              id="current_amount"
              type="number"
              step="0.01"
              className="pl-9"
              placeholder="0,00"
              {...register('current_amount')}
            />
          </div>
          {errors.current_amount && <p className="text-sm text-destructive">{errors.current_amount.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="deadline">Prazo (Opcional)</Label>
          <Input
            id="deadline"
            type="date"
            {...register('deadline')}
          />
          {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={status} 
              onValueChange={(val) => setValue('status', val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status da meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-between pt-4 border-t border-zinc-800">
        <div>
          {isEditing && onDelete && (
            <Button 
              type="button" 
              variant="outline" 
              className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              Excluir Meta
            </Button>
          )}
        </div>
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => navigate('/goals')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Meta'}
          </Button>
        </div>
      </div>
    </form>
  );
}
