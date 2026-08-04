import { supabase } from '../../../core/services/supabase';
import { Goal, GoalsSummary } from '../types/goal.types';

export class GoalRepository {
  async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Goal[];
  }

  async getGoalById(userId: string, goalId: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('id', goalId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as Goal;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  }

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId)
      .eq('id', goalId);

    if (error) throw error;
  }

  async getGoalsSummary(userId: string): Promise<GoalsSummary> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    const activeGoals = goals?.length || 0;
    let totalProgress = 0;
    let nextToExpire: Goal | null = null;

    if (activeGoals > 0) {
      goals.forEach((goal) => {
        const target = Number(goal.target_amount) || 1;
        const current = Number(goal.current_amount) || 0;
        totalProgress += (current / target) * 100;
        
        if (goal.deadline) {
          if (!nextToExpire || new Date(goal.deadline) < new Date(nextToExpire.deadline!)) {
            nextToExpire = goal as Goal;
          }
        }
      });
    }

    const averageProgress = activeGoals > 0 ? totalProgress / activeGoals : 0;

    return {
      activeGoals,
      averageProgress: Math.min(100, Math.max(0, averageProgress)),
      nextToExpire,
    };
  }
}

export const goalRepository = new GoalRepository();
