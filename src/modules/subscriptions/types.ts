export interface Subscription {
  id: string;
  user_id: string;
  transaction_recurrence_id?: string;
  site?: string;
  plan?: string;
  created_at?: string;
  updated_at?: string;
  
  // Simulated fields for UI (joined or computed based on recurrence)
  name?: string;
  amount?: number;
  status?: string;
  next_billing_date?: string;
}
