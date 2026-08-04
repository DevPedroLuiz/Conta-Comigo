import { toast } from "sonner";
import { goalRepository } from '../repositories/GoalRepository';
import { GoalFormData } from '../schemas/goal.schemas';

export class GoalService {
  async getGoals(userId: string) {
    try {
      const data = await goalRepository.getGoals(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting goals:', error);
      return { data: null, error };
    }
  }

  async getGoalById(userId: string, goalId: string) {
    try {
      const data = await goalRepository.getGoalById(userId, goalId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting goal:', error);
      return { data: null, error };
    }
  }

  async createGoal(userId: string, data: GoalFormData) {
    try {
      if (data.target_amount <= 0) {
        throw new Error('O valor objetivo deve ser maior que zero.');
      }
      if (data.current_amount < 0) {
        throw new Error('O valor inicial não pode ser negativo.');
      }

      let status = data.status;
      if (data.current_amount >= data.target_amount && status === 'active') {
        status = 'completed';
      }

      const newGoal = {
        user_id: userId,
        name: data.name,
        description: data.description,
        target_amount: data.target_amount,
        current_amount: data.current_amount,
        deadline: data.deadline || null,
        status,
      };

      const created = await goalRepository.createGoal(newGoal);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating goal:', error);
      return { data: null, error };
    }
  }

  async updateGoal(userId: string, goalId: string, data: GoalFormData) {
    try {
      if (data.target_amount <= 0) {
        throw new Error('O valor objetivo deve ser maior que zero.');
      }
      if (data.current_amount < 0) {
        throw new Error('O valor atual não pode ser negativo.');
      }

      let status = data.status;
      if (data.current_amount >= data.target_amount && status === 'active') {
        status = 'completed';
      }

      const updates = {
        name: data.name,
        description: data.description,
        target_amount: data.target_amount,
        current_amount: data.current_amount,
        deadline: data.deadline || null,
        status,
      };

      const updated = await goalRepository.updateGoal(userId, goalId, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { data: null, error };
    }
  }

  async deleteGoal(userId: string, goalId: string) {
    try {
      await goalRepository.deleteGoal(userId, goalId);
      return { error: null };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { error };
    }
  }

  async addProgress(userId: string, goalId: string, amountToAdd: number) {
    try {
      if (amountToAdd <= 0) {
        throw new Error('O valor adicionado deve ser maior que zero.');
      }

      const goal = await goalRepository.getGoalById(userId, goalId);
      if (!goal) {
        throw new Error('Meta não encontrada.');
      }

      const newCurrentAmount = Number(goal.current_amount) + amountToAdd;
      let newStatus = goal.status;

      if (newCurrentAmount >= Number(goal.target_amount) && newStatus === 'active') {
        newStatus = 'completed';
      }

      const updated = await goalRepository.updateGoal(userId, goalId, {
        current_amount: newCurrentAmount,
        status: newStatus,
      });

      return { data: updated, error: null };
    } catch (error) {
      console.error('Error adding progress to goal:', error);
      return { data: null, error };
    }
  }

  async getGoalsSummary(userId: string) {
    try {
      const summary = await goalRepository.getGoalsSummary(userId);
      return { data: summary, error: null };
    } catch (error) {
      console.error('Error getting goals summary:', JSON.stringify(error, null, 2)); toast.error(`Goal err: ${error?.message || JSON.stringify(error)}`);
      return { data: null, error };
    }
  }
}

export const goalService = new GoalService();
