import { supabase } from '../../../core/services/supabase';
import { Budget } from '../types/budget.types';

export class BudgetRepository {
  async getBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (id, name, color, icon)
      `)
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year)
      .order('limit_amount', { ascending: false });

    if (error) throw error;
    return data as Budget[];
  }

  async getBudgetById(userId: string, id: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select(`*, categories (id, name, color, icon)`)
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Budget;
  }

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'categories' | 'spent_amount'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single();

    if (error) throw error;
    return data as Budget;
  }

  async updateBudget(userId: string, id: string, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Budget;
  }

  async deleteBudget(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);

    if (error) throw error;
  }
}

export const budgetRepository = new BudgetRepository();
