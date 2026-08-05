import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../auth/services/AuthService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../core/ui/components/dialog';
import { Button } from '../../../core/ui/components/button';
import { Input } from '../../../core/ui/components/input';
import { Label } from '../../../core/ui/components/label';
import { Spinner } from '../../../core/ui/components/spinner';

export function AccountDeletionDialog() {
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const navigate = useNavigate();

  const isConfirmed = confirmationText === 'EXCLUIR';

  const deleteAccountMutation = useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      toast.success('Conta excluída com sucesso.');
      setOpen(false);
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao excluir conta.');
    },
  });

  const handleDelete = () => {
    if (isConfirmed) {
      deleteAccountMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setConfirmationText('');
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="destructive">Excluir Conta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Conta Definitivamente</DialogTitle>
          <DialogDescription>
            Atenção: Esta ação é irreversível. Todos os seus dados, contas, transações e configurações serão apagados permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm">
              Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="EXCLUIR"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleteAccountMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!isConfirmed || deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Excluir Minha Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
