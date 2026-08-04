export type InvestmentAssetType = 'STOCK' | 'FII' | 'ETF' | 'CRYPTO' | 'FIXED_INCOME' | 'TREASURY' | 'OTHER';
export type MovementType = 'BUY' | 'SELL';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  broker: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentAsset {
  id: string;
  investment_id: string;
  user_id: string;
  ticker: string;
  name: string;
  type: InvestmentAssetType;
  quantity: number;
  average_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
  
  investments?: Investment; // Joined data
}

export interface InvestmentMovement {
  id: string;
  user_id: string;
  investment_asset_id: string;
  transaction_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_price: number;
  total_amount: number;
  fees: number;
  taxes: number;
  movement_date: string;
  created_at: string;
}

export interface Dividend {
  id: string;
  user_id: string;
  investment_asset_id: string;
  transaction_id: string;
  amount: number;
  payment_date: string;
  created_at: string;
}

export interface InvestmentsSummary {
  total_invested: number;
  current_total_value: number;
  profitability: number;
  profitability_percentage: number;
}
