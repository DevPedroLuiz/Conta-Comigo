import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../core/services/supabase';
import { useUser } from '../../auth/hooks/useAuth';

export function useTransactionsSubscription() {
  const queryClient = useQueryClient();
  const user = useUser();

  useEffect(() => {
    if (!user) return;

    // Supabase Realtime Subscription para a tabela 'transactions'
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Monitora INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`, // Apenas transações do usuário atual
        },
        (payload) => {
          console.log('Realtime Event Received:', payload);
          // Invalida as queries de forma silenciosa para forçar refetch
          // sem causar loops de renderização infinitos.
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    return () => {
      // Limpeza da subscrição no unmount para não estourar limite de channels
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);
}
