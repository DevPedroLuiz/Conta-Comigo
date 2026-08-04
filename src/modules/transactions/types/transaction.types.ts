export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
  accounts?: {
    id: string;
    name: string;
  };
}
