export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: GoalStatus;
  created_at?: string;
  updated_at?: string;
}

export interface GoalsSummary {
  activeGoals: number;
  averageProgress: number;
  nextToExpire?: Goal | null;
}
