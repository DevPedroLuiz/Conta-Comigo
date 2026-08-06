import { creditCardsRepository } from '../repositories/CreditCardsRepository';
import { CreditCardFormData } from '../schemas/credit-card.schemas';

export class CreditCardsService {
  async getCreditCards(userId: string) {
    try {
      const data = await creditCardsRepository.getCreditCards(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      return { data: null, error };
    }
  }

  async getCreditCardById(userId: string, id: string) {
    try {
      const data = await creditCardsRepository.getCreditCardById(userId, id);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching credit card:', error);
      return { data: null, error };
    }
  }

  async createCreditCard(userId: string, data: CreditCardFormData) {
    try {
      const newCard = {
        user_id: userId,
        name: data.name,
        limit: data.limit,
        closing_day: data.closing_day,
        due_day: data.due_day,
        brand: data.brand || '',
        color: data.color || '#000000',
      };
      const created = await creditCardsRepository.createCreditCard(newCard);
      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating credit card:', error);
      return { data: null, error };
    }
  }

  async updateCreditCard(userId: string, id: string, data: CreditCardFormData) {
    try {
      const updates = {
        name: data.name,
        limit: data.limit,
        closing_day: data.closing_day,
        due_day: data.due_day,
        brand: data.brand || '',
        color: data.color || '#000000',
      };
      const updated = await creditCardsRepository.updateCreditCard(userId, id, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating credit card:', error);
      return { data: null, error };
    }
  }

  async deleteCreditCard(userId: string, id: string) {
    try {
      await creditCardsRepository.deleteCreditCard(userId, id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting credit card:', error);
      return { error };
    }
  }

  async getInvoices(userId: string, creditCardId: string) {
    try {
      const card = await creditCardsRepository.getCreditCardById(userId, creditCardId);
      if (!card) throw new Error('Credit card not found');
      const transactions = await creditCardsRepository.getCardTransactions(creditCardId);
      
      const invoiceTotals: Record<string, number> = {};
      const invoiceTransactions: Record<string, any[]> = {};
      
      for (const tx of transactions) {
        const rawAmount = Math.abs(tx.amount);
        const amount = tx.type === 'EXPENSE' ? rawAmount : -rawAmount;
        const txDate = new Date(tx.date + 'T00:00:00');
        let month = txDate.getMonth() + 1;
        let year = txDate.getFullYear();
        
        // If the transaction date is equal to or after the closing day, it falls into the next invoice month.
        if (txDate.getDate() >= card.closing_day) {
          month += 1;
          if (month > 12) {
            month = 1;
            year += 1;
          }
        }
        
        const key = `${year}-${month}`;
        invoiceTotals[key] = (invoiceTotals[key] || 0) + amount;
        
        if (!invoiceTransactions[key]) {
          invoiceTransactions[key] = [];
        }
        invoiceTransactions[key].push(tx);
      }
      
      let existingInvoices = await creditCardsRepository.getInvoices(creditCardId);

      const existingKeys = new Set(existingInvoices.map(i => `${i.year}-${i.month}`));
      
      for (const key of Object.keys(invoiceTotals)) {
        if (!existingKeys.has(key)) {
          const [y, m] = key.split('-');
          const newInvoice = await creditCardsRepository.createInvoice({
            credit_card_id: creditCardId,
            year: parseInt(y),
            month: parseInt(m)
          });
          existingInvoices.push(newInvoice);
          existingKeys.add(key);
        }
      }
      
      existingInvoices = existingInvoices.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month; // Month ascending
      });
      
      const invoiceIds = existingInvoices.map(i => i.id);
      const payments = await creditCardsRepository.getInvoicePayments(invoiceIds);
      const paidInvoiceIds = new Set(payments.map((p: any) => p.credit_card_invoice_id));
      
      const data = existingInvoices.map(inv => {
        const key = `${inv.year}-${inv.month}`;
        // Support either legacy payments or the new status column
        const isPaid = (inv as any).status === 'PAID' || paidInvoiceIds.has(inv.id);
        
        // Ensure total amount is never negative, in case of refunds exceeding expenses
        const calculatedTotal = invoiceTotals[key] || 0;
        const totalAmount = calculatedTotal < 0 ? 0 : calculatedTotal;
        
        return {
          ...inv,
          total_amount: totalAmount,
          transactions: invoiceTransactions[key] || [],
          status: isPaid ? 'PAID' : 'OPEN'
        };
      });
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { data: null, error };
    }
  }

  async payInvoice(userId: string, invoiceId: string, accountId: string, amount: number, date: string) {
    try {
      const { supabase } = await import('../../../core/services/supabase');
      let { data: cat } = await supabase.from('categories').select('id').eq('type', 'EXPENSE').eq('user_id', userId).limit(1).single();
      if (!cat) {
        let { data: defaultCat } = await supabase.from('categories').select('id').eq('type', 'EXPENSE').eq('is_default', true).limit(1).single();
        cat = defaultCat;
      }
      const categoryId = cat?.id;
      const { data: transaction, error: txError } = await import('../../transactions/services/TransactionService').then(m => m.transactionService.createTransaction(userId, {
        type: 'EXPENSE',
        amount: Math.abs(amount), // Ensure positive value
        description: 'Pagamento de Fatura',
        category_id: categoryId as string,
        account_id: accountId,
        date,
        status: 'PAID'
      } as any));
      if (txError || !transaction) throw txError || new Error('Transaction creation failed');
      await creditCardsRepository.payInvoice(invoiceId, transaction.id);
      
      // Update status column too
      await creditCardsRepository.updateInvoiceStatus(invoiceId, 'PAID');
      return { error: null };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { error };
    }
  }

  async toggleInvoiceStatus(invoiceId: string, currentStatus: 'OPEN' | 'PAID') {
    try {
      const newStatus = currentStatus === 'PAID' ? 'OPEN' : 'PAID';
      await creditCardsRepository.updateInvoiceStatus(invoiceId, newStatus);
      return { error: null };
    } catch (error) {
      console.error('Error toggling invoice status:', error);
      return { error };
    }
  }
}

export const creditCardsService = new CreditCardsService();
