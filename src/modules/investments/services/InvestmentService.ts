import { supabase } from '../../../core/services/supabase';
import { investmentRepository } from '../repositories/InvestmentRepository';
import { transactionRepository } from '../../transactions/repositories/TransactionRepository';
import { categoryRepository } from '../../categories/repositories/CategoryRepository';
import { Investment, InvestmentAsset, InvestmentMovement, Dividend, InvestmentsSummary, MovementType, InvestmentAssetType } from '../types/investment.types';
import { TransactionType, TransactionStatus } from '../../transactions/types/transaction.types';
import { InvestmentFormData, AssetFormData, MovementFormData, DividendFormData } from '../schemas/investment.schemas';

export class InvestmentService {
  
  // --- Investments ---
  async getInvestments(userId: string) {
    try {
      const data = await investmentRepository.getInvestments(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting investments:', error);
      return { data: null, error };
    }
  }

  async createInvestment(userId: string, data: InvestmentFormData) {
    try {
      const created = await investmentRepository.createInvestment(userId, data);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating investment:', error);
      return { data: null, error };
    }
  }

  // --- Assets ---
  async getAssets(userId: string) {
    try {
      const data = await investmentRepository.getAssets(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting assets:', error);
      return { data: null, error };
    }
  }

  async createAsset(userId: string, data: AssetFormData) {
    try {
      const created = await investmentRepository.createAsset(userId, {
        ...data,
        quantity: 0,
        average_price: 0,
        current_price: 0
      });
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating asset:', error);
      return { data: null, error };
    }
  }

  async updateAssetCurrentPrice(userId: string, assetId: string, currentPrice: number) {
    try {
      await investmentRepository.updateAssetPrices(assetId, userId, currentPrice);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating asset price:', error);
      return { success: false, error };
    }
  }

  // --- Movements ---
  async getMovements(userId: string, assetId?: string) {
    try {
      const data = await investmentRepository.getMovements(userId, assetId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting movements:', error);
      return { data: null, error };
    }
  }

  async createMovement(
    userId: string, 
    assetId: string, 
    data: MovementFormData
  ) {
    try {
      const totalAmount = data.quantity * data.price;

      const asset = await investmentRepository.getAssetById(assetId, userId);
      if (!asset) throw new Error('Ativo não encontrado');

      if (data.type === 'SELL' && asset.quantity < data.quantity) {
        throw new Error('Quantidade insuficiente para venda');
      }

      // 1. Create Transaction (Transferência Patrimonial)
      const txType: TransactionType = data.type === 'BUY' ? 'TRANSFER_OUT' : 'TRANSFER_IN';
      const description = data.type === 'BUY' 
        ? `Compra de Ativo - ${asset.ticker}`
        : `Venda de Ativo - ${asset.ticker}`;
      
      const category = await categoryRepository.getOrCreateCategoryByName(userId, 'Investimentos', 'trending-up', '#3b82f6');
      if (!category) throw new Error('Falha ao obter categoria de investimento');

      const transaction = await transactionRepository.createTransaction({
        user_id: userId,
        account_id: data.account_id,
        category_id: category.id,
        type: txType,
        description,
        amount: totalAmount,
        date: data.date,
        status: 'PAID',
      });

      // 2. Create Movement
      const movement = await investmentRepository.createMovement(userId, {
        investment_asset_id: assetId,
        transaction_id: transaction.id,
        movement_type: data.type,
        quantity: data.quantity,
        unit_price: data.price,
        total_amount: totalAmount,
        movement_date: data.date
      });

      // 3. Update Asset Average Price and Quantity
      let newQuantity = Number(asset.quantity);
      let newAveragePrice = Number(asset.average_price);

      if (data.type === 'BUY') {
        const totalValueBefore = newQuantity * newAveragePrice;
        const totalValueNew = data.quantity * data.price;
        newQuantity += data.quantity;
        newAveragePrice = (totalValueBefore + totalValueNew) / newQuantity;
      } else if (data.type === 'SELL') {
        newQuantity -= data.quantity;
        if (newQuantity === 0) {
          newAveragePrice = 0;
        }
      }

      await investmentRepository.updateAsset(assetId, userId, {
        quantity: newQuantity,
        average_price: newAveragePrice,
        current_price: data.price // assume latest price is current price
      });

      return { data: movement, error: null };
    } catch (error) {
      console.error('Error creating movement:', error);
      return { data: null, error };
    }
  }

  // --- Dividends ---
  async getDividends(userId: string, assetId?: string) {
    try {
      const data = await investmentRepository.getDividends(userId, assetId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting dividends:', error);
      return { data: null, error };
    }
  }

  async createDividend(
    userId: string,
    assetId: string,
    data: DividendFormData
  ) {
    try {
      const asset = await investmentRepository.getAssetById(assetId, userId);
      if (!asset) throw new Error('Ativo não encontrado');

      // 1. Create Transaction (Real Income)
      const category = await categoryRepository.getOrCreateCategoryByName(userId, 'Dividendos', 'dollar-sign', '#10b981');
      if (!category) throw new Error('Falha ao obter categoria de dividendos');

      const transaction = await transactionRepository.createTransaction({
        user_id: userId,
        account_id: data.account_id,
        category_id: category.id,
        type: 'INCOME',
        description: `Dividendos - ${asset.ticker}`,
        amount: data.amount,
        date: data.date,
        status: 'PAID',
      });

      // 2. Create Dividend Record
      const dividend = await investmentRepository.createDividend(userId, {
        investment_asset_id: assetId,
        transaction_id: transaction.id,
        amount: data.amount,
        payment_date: data.date
      });

      return { data: dividend, error: null };
    } catch (error) {
      console.error('Error creating dividend:', error);
      return { data: null, error };
    }
  }

  // --- Summary ---
  async getSummary(userId: string) {
    try {
      const data = await investmentRepository.getSummary(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error getting summary:', error);
      return { data: null, error };
    }
  }
}

export const investmentService = new InvestmentService();
