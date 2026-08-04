import React, { useState } from 'react';
import { Goal } from '../types/goal.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../core/ui/components/dialog';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';

interface GoalAddProgressDialogProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalId: string, amount: number) => Promise<void>;
  isLoading: boolean;
}

export function GoalAddProgressDialog({ goal, isOpen, onClose, onSubmit, isLoading }: GoalAddProgressDialogProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(',', '.'));
    
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor válido maior que zero.');
      return;
    }

    await onSubmit(goal.id, value);
    setAmount('');
    setError('');
  };

  const remaining = Number(goal.target_amount) - Number(goal.current_amount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border text-muted-foreground">
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adicione um valor ao progresso da meta "{goal.name}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor a adicionar</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
              <Input
                type="number"
                step="0.01"
                className="pl-9 bg-background border-border"
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive dark:text-red-400">{error}</p>}
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para concluir.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
