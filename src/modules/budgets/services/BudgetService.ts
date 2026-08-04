import { budgetRepository } from '../repositories/BudgetRepository';
import { BudgetFormData } from '../schemas/budget.schemas';
import { transactionService } from '../../transactions/services/TransactionService';

export class BudgetService {
  async getBudgetsWithSpent(userId: string, month: number, year: number) {
    try {
      const budgets = await budgetRepository.getBudgets(userId, month, year);
      
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data: transactions } = await transactionService.getTransactions({
        userId,
        startDate,
        endDate,
        type: 'EXPENSE'
      });

      const txs = transactions || [];
      
      const enrichedBudgets = budgets.map(budget => {
        const spent = txs
          .filter(tx => tx.category_id === budget.category_id)
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        return {
          ...budget,
          spent_amount: spent
        };
      });

      return { data: enrichedBudgets, error: null };
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return { data: null, error };
    }
  }

  async getBudgetById(userId: string, id: string) {
    try {
      const data = await budgetRepository.getBudgetById(userId, id);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching budget:', error);
      return { data: null, error };
    }
  }

  async createBudget(userId: string, data: BudgetFormData) {
    try {
      const newBudget = {
        user_id: userId,
        category_id: data.category_id,
        month: data.month,
        year: data.year,
        limit_amount: data.limit_amount,
      };
      
      const created = await budgetRepository.createBudget(newBudget);
      return { data: created, error: null };
    } catch (error: any) {
      console.error('Error creating budget:', error);
      // Handle unique constraint violation
      if (error?.code === '23505') {
        return { data: null, error: new Error('Já existe um orçamento para esta categoria neste mês/ano.') };
      }
      return { data: null, error };
    }
  }

  async updateBudget(userId: string, id: string, data: BudgetFormData) {
    try {
      const updates = {
        category_id: data.category_id,
        month: data.month,
        year: data.year,
        limit_amount: data.limit_amount,
      };
      
      const updated = await budgetRepository.updateBudget(userId, id, updates);
      return { data: updated, error: null };
    } catch (error: any) {
      console.error('Error updating budget:', error);
      if (error?.code === '23505') {
        return { data: null, error: new Error('Já existe um orçamento para esta categoria neste mês/ano.') };
      }
      return { data: null, error };
    }
  }

  async deleteBudget(userId: string, id: string) {
    try {
      await budgetRepository.deleteBudget(userId, id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting budget:', error);
      return { error };
    }
  }
}

export const budgetService = new BudgetService();
