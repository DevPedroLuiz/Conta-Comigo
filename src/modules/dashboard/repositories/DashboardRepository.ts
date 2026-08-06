import { supabase } from '../../../core/services/supabase';

export interface DashboardSummary {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyIncomeChange?: number;
  monthlyExpenseChange?: number;
  accountsCount: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  color: string;
}

export class DashboardRepository {
  async getAccountsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return count || 0;
  }

  async getCurrentBalance(userId: string): Promise<number> {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('user_id', userId);

    if (error) throw error;
    
    return accounts?.reduce((acc, account) => acc + (Number(account.current_balance) || 0), 0) || 0;
  }

  async getMonthlyIncome(userId: string, startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'INCOME')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return data?.reduce((acc, tx) => acc + Number(tx.amount), 0) || 0;
  }

  async getMonthlyExpenses(userId: string, startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'EXPENSE')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return data?.reduce((acc, tx) => acc + Number(tx.amount), 0) || 0;
  }

  async getRecentTransactions(userId: string, limit = 5): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        description,
        amount,
        type,
        date,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((tx: any) => ({
      id: tx.id,
      description: tx.description,
      amount: Number(tx.amount),
      type: tx.type,
      date: tx.date,
      category: {
        name: tx.categories?.name || 'Geral',
        icon: tx.categories?.icon || 'tag',
        color: tx.categories?.color || '#888888',
      }
    }));
  }

  async getExpenseByCategory(userId: string, startDate: string, endDate: string): Promise<ExpenseByCategory[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        categories (
          name,
          color
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'EXPENSE')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const expensesByCategory: Record<string, ExpenseByCategory> = {};

    data?.forEach((tx: any) => {
      const categoryName = tx.categories?.name || 'Geral';
      const categoryColor = tx.categories?.color || '#888888';
      const amount = Math.abs(Number(tx.amount) || 0);

      if (amount <= 0) return;

      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = {
          category: categoryName,
          amount: 0,
          color: categoryColor,
        };
      }
      
      expensesByCategory[categoryName].amount += amount;
    });

    return Object.values(expensesByCategory).sort((a, b) => b.amount - a.amount);
  }
}

export const dashboardRepository = new DashboardRepository();
