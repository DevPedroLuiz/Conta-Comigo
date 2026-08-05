import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../core/ui/components/dialog';
import { Spinner } from '../../../core/ui/components/spinner';
import { openFinanceService } from '../services/OpenFinanceService';
import { toast } from 'sonner';
import { PluggyConnect } from 'react-pluggy-connect';

interface BankSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
}

export function BankSyncModal({ open, onOpenChange, onSyncComplete }: BankSyncModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);

  useEffect(() => {
    if (open) {
      const loadToken = async () => {
        setLoadingToken(true);
        try {
          const connectToken = await openFinanceService.getConnectToken();
          setToken(connectToken);
        } catch (error) {
          toast.error('Erro ao conectar ao provedor de Open Finance.');
          onOpenChange(false);
        } finally {
          setLoadingToken(false);
        }
      };
      
      loadToken();
    } else {
      // Reset state when modal closes
      setToken(null);
    }
  }, [open, onOpenChange]);

  const handleSuccess = (itemData: { item: { id: string } }) => {
    toast.success('Conta vinculada com sucesso!');
    if (onSyncComplete) {
      onSyncComplete();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sincronização Bancária</DialogTitle>
          <DialogDescription>
            Conecte sua conta bancária de forma segura através do Open Finance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-[300px]">
          {loadingToken ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-sm">Iniciando conexão segura...</p>
            </div>
          ) : token ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <PluggyConnect
                connectToken={token}
                onSuccess={handleSuccess}
                onError={(error) => {
                  console.error('Pluggy erro:', error);
                  toast.error('Erro na conexão com o banco.');
                }}
              />
            </div>
          ) : (
            <div className="text-center text-sm text-destructive">
              Falha ao carregar configuração.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
