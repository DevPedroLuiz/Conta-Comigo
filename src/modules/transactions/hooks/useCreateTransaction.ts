import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/TransactionService';
import { TransactionFormData } from '../schemas/transaction.schemas';
import { useUser } from '../../auth/hooks/useAuth';
import { toast } from 'sonner';

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const user = useUser();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data: created, error } = await transactionService.createTransaction(user.id, data);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return created;
    },
    // Optimistic Update: Injeta a transação na cache antes do servidor confirmar
    onMutate: async (newTransaction) => {
      // 1. Cancela queries pendentes para não sobrescreverem nosso update otimista
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard-summary'] });

      // 2. Tira uma "foto" (snapshot) do cache atual para caso precise fazer rollback
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // 3. Atualiza a query de transactions manualmente com um ID temporário e data atual
      // A estrutura da transação no frontend pode diferir levemente, montamos um objeto básico compatível
      const optimisticTransaction = {
        id: `temp-${Date.now()}`,
        ...newTransaction,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['transactions'], (old: any) => {
        if (!old) return [optimisticTransaction];
        // Adiciona a transação no topo da lista
        return [optimisticTransaction, ...old];
      });

      // Retorna o contexto com o estado anterior para rollback
      return { previousTransactions };
    },
    // Rollback em caso de erro na Mutation
    onError: (err, newTransaction, context) => {
      console.error('Falha ao criar transação. Rollback aplicado:', err);
      
      // Reverte para a "foto" tirada no onMutate
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }

      toast.error('Erro ao salvar transação', {
        description: 'Parece que você está offline ou houve um erro no servidor. Tente novamente.',
      });
    },
    // Sincronização final: Executa sempre, independentemente de sucesso ou erro
    onSettled: () => {
      // Força um refetch em background para garantir que o cache está perfeitamente sincronizado com o BD
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
    onSuccess: () => {
      toast.success('Transação criada com sucesso!');
    },
  });
}
