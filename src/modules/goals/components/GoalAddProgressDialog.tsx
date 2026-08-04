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
      <DialogContent className="sm:max-w-md bg-[#0c0c0e] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adicione um valor ao progresso da meta "{goal.name}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor a adicionar</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500">R$</span>
              <Input
                type="number"
                step="0.01"
                className="pl-9 bg-zinc-900 border-zinc-800"
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {remaining > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
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
