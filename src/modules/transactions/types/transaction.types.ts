export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER_IN' | 'TRANSFER_OUT';
export type TransactionStatus = 'PAID' | 'UNPAID';

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  credit_card_id?: string;
  category_id: string;
  recurrence_id?: string;
  installment_id?: string;
  status: TransactionStatus;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  notes?: string;
  is_internal_transfer?: boolean;
  is_subscription?: boolean;
  is_investment?: boolean;
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
  credit_cards?: {
    id: string;
    name: string;
  };
}
