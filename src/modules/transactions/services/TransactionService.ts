import { transactionRepository, GetTransactionsFilters, referenceRepository } from '../repositories/TransactionRepository';
import { TransactionFormData } from '../schemas/transaction.schemas';
import { Transaction } from '../types/transaction.types';

export class TransactionService {
  async getTransactions(filters: GetTransactionsFilters) {
    try {
      const data = await transactionRepository.getTransactions(filters);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting transactions:', error);
      return { data: null, error };
    }
  }

  async getTransactionById(userId: string, transactionId: string) {
    try {
      const data = await transactionRepository.getTransactionById(userId, transactionId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting transaction:', error);
      return { data: null, error };
    }
  }

  async createTransaction(userId: string, data: TransactionFormData) {
    try {
      if (data.amount <= 0) {
        throw new Error('O valor da transação deve ser maior que zero.');
      }
      
      const newTransaction = {
        user_id: userId,
        type: data.type,
        description: data.description,
        amount: data.amount, // Income is positive, Expense is positive, we handle it logically in dashboard or store
        category_id: data.category_id,
        account_id: data.account_id,
        date: data.date,
        notes: data.notes || '',
      };

      const created = await transactionRepository.createTransaction(newTransaction);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { data: null, error };
    }
  }

  async updateTransaction(userId: string, transactionId: string, data: TransactionFormData) {
    try {
      if (data.amount <= 0) {
        throw new Error('O valor da transação deve ser maior que zero.');
      }

      const updates = {
        type: data.type,
        description: data.description,
        amount: data.amount,
        category_id: data.category_id,
        account_id: data.account_id,
        date: data.date,
        notes: data.notes || '',
      };

      const updated = await transactionRepository.updateTransaction(userId, transactionId, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { data: null, error };
    }
  }

  async deleteTransaction(userId: string, transactionId: string) {
    try {
      await transactionRepository.deleteTransaction(userId, transactionId);
      return { error: null };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { error };
    }
  }
  
  // Helpers to load form data
  async getFormData(userId: string) {
    try {
      const [accounts, categories] = await Promise.all([
        referenceRepository.getAccounts(userId),
        referenceRepository.getCategories(userId)
      ]);
      return { data: { accounts, categories }, error: null };
    } catch (error) {
      console.error('Error fetching form references:', error);
      return { data: null, error };
    }
  }
}

export const transactionService = new TransactionService();
