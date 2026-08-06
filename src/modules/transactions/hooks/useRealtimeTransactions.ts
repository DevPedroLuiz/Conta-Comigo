import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/services/supabase';
import { useUser } from '../../auth/hooks/useAuth';

export function useRealtimeTransactions() {
  const queryClient = useQueryClient();
  const user = useUser();
  
  // Usamos uma referência para o debounce do timer
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('realtime:transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_events',
          filter: `user_id=eq.${user.id}`, // Filtro Cliente Otimizado (o Servidor já filtra por RLS)
        },
        (payload) => {
          console.log('[Realtime] Evento recebido:', payload);
          
          // Solução de Gargalo: Debounce na Invalidação
          // Evita loops de re-renderização e refetching agressivo caso o mobile 
          // ou a esteira envie uma rajada de 50 transações simultâneas.
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(() => {
            // Invalida a query principal para buscar a nova lista do backend, 
            // sem trafegar dados sensíveis pelo WebSocket
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
            
            console.log('[Realtime] Cache invalidado após debounce.');
          }, 300); // 300ms de "silêncio" antes de engatilhar o fetch
        }
      )
      .subscribe();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(subscription);
    };
  }, [user, queryClient]);
}
