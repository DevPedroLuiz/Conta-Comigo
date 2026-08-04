export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  limit: number;
  closing_day: number;
  due_day: number;
  brand?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreditCardInvoice {
  id: string;
  credit_card_id: string;
  month: number;
  year: number;
  total_amount?: number; // Calculated field
}
