export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: number;
  year: number;
  limit_amount: number;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  
  // Calculated
  spent_amount?: number;
}
