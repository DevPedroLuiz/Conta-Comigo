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
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../core/services/supabase';

interface BankSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
}

export function BankSyncModal({ open, onOpenChange, onSyncComplete }: BankSyncModalProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (open) {
      const loadToken = async () => {
        setLoadingToken(true);
        try {
          const connectToken = await openFinanceService.getConnectToken();
          setToken(connectToken);
        } catch (error: any) {
          toast.error(error.message || 'Erro ao conectar ao provedor de Open Finance.');
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

  const handleSuccess = async (itemData: { item: { id: string } }) => {
    console.log('[AUDITORIA] 1. Widget fechou. Item ID:', itemData.item.id);
    setIsSyncing(true);
    toast.info('Conexão realizada! Sincronizando seus dados...', { id: 'sync-status' });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Usuário não autenticado.');
      }
      
      const response = await fetch('/api/sync-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ itemId: itemData.item.id })
      });
      
      if (!response.ok) {
        let errorMessage = 'Falha ao sincronizar item.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // ignore
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      toast.success(result.message || 'Dados sincronizados com sucesso!', { id: 'sync-status' });
      
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro ao sincronizar dados do banco. Tente novamente mais tarde.', { id: 'sync-status' });
    } finally {
      setIsSyncing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSyncing && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sincronização Bancária</DialogTitle>
          <DialogDescription>
            Conecte sua conta bancária de forma segura através do Open Finance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-[300px]">
          {loadingToken || isSyncing ? (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-sm">{isSyncing ? "Sincronizando suas contas e transações..." : "Iniciando conexão segura..."}</p>
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
