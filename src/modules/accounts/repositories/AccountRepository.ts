import { supabase } from '../../../core/services/supabase';
import { Account } from '../types/account.types';

export class AccountRepository {
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data as Account[];
  }

  async getAccountById(userId: string, accountId: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as Account;
  }

  async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'current_balance'>): Promise<Account> {
    const dataToInsert = {
      ...account,
      current_balance: account.initial_balance, // Set current_balance equal to initial_balance on creation
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  }

  async updateAccount(userId: string, accountId: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data as Account;
  }

  async deleteAccount(userId: string, accountId: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', userId)
      .eq('id', accountId);

    if (error) throw error;
  }

  async getTotalBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('accounts')
      .select('current_balance')
      .eq('user_id', userId);

    if (error) throw error;
    
    return data.reduce((acc, account) => acc + (Number(account.current_balance) || 0), 0);
  }
}

export const accountRepository = new AccountRepository();
