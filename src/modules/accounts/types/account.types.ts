export type AccountType = 
  | 'CHECKING_ACCOUNT'
  | 'SAVINGS_ACCOUNT'
  | 'CASH'
  | 'INVESTMENT'
  | 'CREDIT_CARD';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  accountsCount: number;
  accounts: Account[];
}
