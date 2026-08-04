import { supabase } from '../../../core/services/supabase';
import { Transaction } from '../../transactions/types/transaction.types';
import { ReportFilters } from '../types/report.types';

export class ReportRepository {
  async getTransactionsForReport(userId: string, filters: ReportFilters): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories:category_id(id, name, color, icon),
        accounts:account_id(id, name)
      `)
      .eq('user_id', userId)
      .gte('date', filters.startDate)
      .lte('date', filters.endDate);

    if (filters.type && filters.type !== 'ALL') {
      query = query.eq('type', filters.type);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    query = query.order('date', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  }
}

export const reportRepository = new ReportRepository();
