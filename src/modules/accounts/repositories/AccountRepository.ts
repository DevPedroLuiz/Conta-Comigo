import { supabase } from '../../../core/services/supabase';
import { Account } from '../types/account.types';

export class AccountRepository {
  async getAccounts(userId: string): Promise<Account[]> {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('account_id, amount, type')
      .eq('user_id', userId);

    if (txError) throw txError;

    const accountsWithBalance = accounts?.map(account => {
      const accountTxs = transactions?.filter(tx => tx.account_id === account.id) || [];
      const txBalance = accountTxs.reduce((acc, tx) => {
        if (tx.type === 'INCOME' || tx.type === 'TRANSFER_IN') return acc + Number(tx.amount);
        if (tx.type === 'EXPENSE' || tx.type === 'TRANSFER_OUT') return acc - Number(tx.amount);
        return acc;
      }, 0);
      
      return {
        ...account,
        current_balance: Number(account.initial_balance) + txBalance
      };
    }) || [];

    return accountsWithBalance as Account[];
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
    
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .eq('account_id', accountId);

    if (txError) throw txError;
    
    const txBalance = transactions?.reduce((acc, tx) => {
      if (tx.type === 'INCOME' || tx.type === 'TRANSFER_IN') return acc + Number(tx.amount);
      if (tx.type === 'EXPENSE' || tx.type === 'TRANSFER_OUT') return acc - Number(tx.amount);
      return acc;
    }, 0) || 0;

    return {
      ...data,
      current_balance: Number(data.initial_balance) + txBalance
    } as Account;
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
    const accounts = await this.getAccounts(userId);
    return accounts.reduce((acc, account) => acc + (Number(account.current_balance) || 0), 0);
  }
}

export const accountRepository = new AccountRepository();
