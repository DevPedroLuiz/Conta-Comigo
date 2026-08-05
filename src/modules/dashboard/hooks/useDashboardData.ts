import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/DashboardService';

export function useDashboardData(userId?: string) {
  return useQuery({
    queryKey: ['dashboardData', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await dashboardService.getDashboardData(userId);
      if (error) {
        throw new Error(error.message || 'Error fetching dashboard data');
      }
      if (!data) {
        throw new Error('No dashboard data returned');
      }
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
