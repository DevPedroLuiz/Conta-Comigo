import { supabase } from '../../../core/services/supabase';
import { Investment, InvestmentAsset, InvestmentMovement, Dividend, InvestmentsSummary } from '../types/investment.types';

export const investmentRepository = {
  // --- Investments (Brokers) ---
  async getInvestments(userId: string): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return data || [];
  },

  async createInvestment(userId: string, data: Partial<Investment>): Promise<Investment> {
    const { data: investment, error } = await supabase
      .from('investments')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return investment;
  },

  async updateInvestment(id: string, userId: string, data: Partial<Investment>): Promise<Investment> {
    const { data: investment, error } = await supabase
      .from('investments')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return investment;
  },

  async deleteInvestment(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
  },

  // --- Investment Assets ---
  async getAssets(userId: string): Promise<InvestmentAsset[]> {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        investments (
          name,
          broker
        )
      `)
      .eq('user_id', userId)
      .order('ticker', { ascending: true });

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return data || [];
  },
  
  async getAssetById(id: string, userId: string): Promise<InvestmentAsset> {
    const { data, error } = await supabase
      .from('investment_assets')
      .select(`
        *,
        investments (
          name,
          broker
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return data;
  },

  async createAsset(userId: string, data: Partial<InvestmentAsset>): Promise<InvestmentAsset> {
    const { data: asset, error } = await supabase
      .from('investment_assets')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return asset;
  },

  async updateAsset(id: string, userId: string, data: Partial<InvestmentAsset>): Promise<InvestmentAsset> {
    const { data: asset, error } = await supabase
      .from('investment_assets')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return asset;
  },

  async updateAssetPrices(id: string, userId: string, currentPrice: number): Promise<void> {
    const { error } = await supabase
      .from('investment_assets')
      .update({ current_price: currentPrice })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
  },

  // --- Movements ---
  async getMovements(userId: string, assetId?: string): Promise<InvestmentMovement[]> {
    let query = supabase
      .from('investment_movements')
      .select(`
        *,
        investment_assets (
          ticker,
          name
        )
      `)
      .eq('user_id', userId)
      .order('movement_date', { ascending: false });

    if (assetId) {
      query = query.eq('investment_asset_id', assetId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return data || [];
  },

  async createMovement(userId: string, data: Partial<InvestmentMovement>): Promise<InvestmentMovement> {
    const { data: movement, error } = await supabase
      .from('investment_movements')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return movement;
  },

  // --- Dividends ---
  async getDividends(userId: string, assetId?: string): Promise<Dividend[]> {
    let query = supabase
      .from('dividends')
      .select(`
        *,
        investment_assets (
          ticker,
          name
        )
      `)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
      
    if (assetId) {
      query = query.eq('investment_asset_id', assetId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return data || [];
  },

  async createDividend(userId: string, data: Partial<Dividend>): Promise<Dividend> {
    const { data: dividend, error } = await supabase
      .from('dividends')
      .insert([{ ...data, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.warn("Investment DB error:", error);
      return [] as any;

    }
    return dividend;
  },

  // --- Summary ---
  async getSummary(userId: string): Promise<InvestmentsSummary> {
    const assets = await this.getAssets(userId);
    
    let totalInvested = 0;
    let currentTotalValue = 0;

    assets.forEach(asset => {
      totalInvested += Number(asset.quantity) * Number(asset.average_price);
      currentTotalValue += Number(asset.quantity) * Number(asset.current_price);
    });

    const profitability = currentTotalValue - totalInvested;
    const profitability_percentage = totalInvested > 0 ? (profitability / totalInvested) * 100 : 0;

    return {
      total_invested: totalInvested,
      current_total_value: currentTotalValue,
      profitability,
      profitability_percentage
    };
  }
};
