import { accountRepository } from '../repositories/AccountRepository';
import { AccountFormData } from '../schemas/account.schemas';
import { FinancialSummary } from '../types/account.types';

export class AccountService {
  async getAccounts(userId: string) {
    try {
      const data = await accountRepository.getAccounts(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting accounts:', error);
      return { data: null, error };
    }
  }

  async getAccountById(userId: string, accountId: string) {
    try {
      const data = await accountRepository.getAccountById(userId, accountId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting account:', error);
      return { data: null, error };
    }
  }

  async createAccount(userId: string, data: AccountFormData) {
    try {
      if (typeof data.initial_balance !== 'number' || isNaN(data.initial_balance)) {
        throw new Error('Saldo inicial inválido.');
      }
      
      const newAccount = {
        user_id: userId,
        name: data.name,
        type: data.type,
        initial_balance: data.initial_balance,
        currency: data.currency || 'BRL',
      };

      const created = await accountRepository.createAccount(newAccount);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating account:', error);
      return { data: null, error };
    }
  }

  async updateAccount(userId: string, accountId: string, data: AccountFormData) {
    try {
      if (typeof data.initial_balance !== 'number' || isNaN(data.initial_balance)) {
        throw new Error('Saldo inicial inválido.');
      }

      // We only update the initial_balance in this form, maybe name and type.
      // Modifying initial_balance might require re-calculating current_balance in a real app, 
      // but for simplicity we'll just update what the form sends.
      const updates = {
        name: data.name,
        type: data.type,
        initial_balance: data.initial_balance,
        currency: data.currency || 'BRL',
      };

      const updated = await accountRepository.updateAccount(userId, accountId, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating account:', error);
      return { data: null, error };
    }
  }

  async deleteAccount(userId: string, accountId: string) {
    try {
      await accountRepository.deleteAccount(userId, accountId);
      return { error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { error };
    }
  }

  async getFinancialSummary(userId: string): Promise<{ data: FinancialSummary | null, error: any }> {
    try {
      const accounts = await accountRepository.getAccounts(userId);
      const totalBalance = await accountRepository.getTotalBalance(userId);
      
      const summary: FinancialSummary = {
        totalBalance,
        accountsCount: accounts.length,
        accounts
      };
      
      return { data: summary, error: null };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      return { data: null, error };
    }
  }
}

export const accountService = new AccountService();
