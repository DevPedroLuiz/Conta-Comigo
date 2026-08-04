import { supabase } from '../../../core/services/supabase';
import { Transaction, TransactionType } from '../types/transaction.types';

export interface GetTransactionsFilters {
  userId: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
}

export class TransactionRepository {
  async getTransactions(filters: GetTransactionsFilters): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (id, name, color, icon),
        accounts (id, name)
      `)
      .eq('user_id', filters.userId)
      .order('date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Transaction[];
  }

  async getTransactionById(userId: string, transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as Transaction;
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  async updateTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('id', transactionId);

    if (error) throw error;
  }
}

export const transactionRepository = new TransactionRepository();

// Add these to the end
export class ReferenceRepository {
  async getAccounts(userId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data;
  }

  async getCategories(userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, type')
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order('name');
    if (error) throw error;
    return data;
  }
}
export const referenceRepository = new ReferenceRepository();
