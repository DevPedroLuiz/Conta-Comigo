export type CategoryType = 'EXPENSE' | 'INCOME';

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}
