import { supabase } from '../../../core/services/supabase';
import { CreditCard, CreditCardInvoice } from '../types';

export class CreditCardsRepository {
  async getCreditCards(userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    if (error) throw error;
    return data as CreditCard[];
  }

  async getCreditCardById(userId: string, id: string): Promise<CreditCard | null> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as CreditCard;
  }

  async createCreditCard(creditCard: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>): Promise<CreditCard> {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert(creditCard)
      .select()
      .single();
    if (error) throw error;
    return data as CreditCard;
  }

  async updateCreditCard(userId: string, id: string, updates: Partial<CreditCard>): Promise<CreditCard> {
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CreditCard;
  }

  async deleteCreditCard(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }

  async getInvoices(creditCardId: string): Promise<CreditCardInvoice[]> {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('credit_card_id', creditCardId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (error) throw error;
    return data as CreditCardInvoice[];
  }

  async getCardTransactions(creditCardId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('credit_card_id', creditCardId);
    if (error) throw error;
    return data;
  }

  async createInvoice(invoice: { credit_card_id: string, month: number, year: number }): Promise<CreditCardInvoice> {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .insert(invoice)
      .select()
      .single();
    if (error) throw error;
    return data as CreditCardInvoice;
  }

  async updateInvoiceStatus(invoiceId: string, status: "OPEN" | "PAID"): Promise<void> {
    const { error } = await supabase.from("credit_card_invoices").update({ status }).eq("id", invoiceId);
    if (error) throw error;
  }

  async getInvoicePayments(invoiceIds: string[]) {
    if (invoiceIds.length === 0) return [];
    const { data, error } = await supabase
      .from('invoice_payments')
      .select('*')
      .in('credit_card_invoice_id', invoiceIds);
    if (error) throw error;
    return data;
  }

  async payInvoice(invoiceId: string, transactionId: string) {
    const { error } = await supabase
      .from('invoice_payments')
      .insert({ credit_card_invoice_id: invoiceId, transaction_id: transactionId });
    if (error) throw error;
  }
}

export const creditCardsRepository = new CreditCardsRepository();
