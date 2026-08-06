import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/TransactionService';
import { GetTransactionsFilters } from '../repositories/TransactionRepository';

export function useTransactions(filters: GetTransactionsFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data, error } = await transactionService.getTransactions(filters);
      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
