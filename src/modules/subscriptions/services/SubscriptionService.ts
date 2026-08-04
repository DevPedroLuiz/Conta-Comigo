import { subscriptionRepository } from '../repositories/SubscriptionRepository';
import { SubscriptionFormData } from '../schemas/subscription.schemas';

export class SubscriptionService {
  async getSubscriptions(userId: string) {
    try {
      const data = await subscriptionRepository.getSubscriptions(userId);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return { data: null, error };
    }
  }

  async getSubscriptionById(userId: string, id: string) {
    try {
      const data = await subscriptionRepository.getSubscriptionById(userId, id);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return { data: null, error };
    }
  }

  async createSubscription(userId: string, data: SubscriptionFormData) {
    try {
      const recurrenceId = await subscriptionRepository.createRecurrence(userId);

      const newSub = {
        user_id: userId,
        site: data.site,
        plan: data.plan || '',
        transaction_recurrence_id: recurrenceId
      };
      const created = await subscriptionRepository.createSubscription(newSub);

      const { supabase } = await import('../../../core/services/supabase');
      let { data: cat } = await supabase.from('categories').select('id').eq('type', 'EXPENSE').eq('user_id', userId).limit(1).single();
      if (!cat) {
        let { data: defaultCat } = await supabase.from('categories').select('id').eq('type', 'EXPENSE').eq('is_default', true).limit(1).single();
        cat = defaultCat;
      }
      
      const date = new Date();
      date.setDate(data.billing_day || 1);
      
      await import('../../transactions/services/TransactionService').then(m => m.transactionService.createTransaction(userId, {
        type: 'EXPENSE',
        amount: data.amount || 0,
        description: `Assinatura: ${data.site} - ${data.plan || ''}`,
        category_id: cat?.id as string,
        date: date.toISOString().split('T')[0],
        status: 'PAID'
      } as any));

      return { data: created, error: null };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { data: null, error };
    }
  }

  async updateSubscription(userId: string, id: string, data: SubscriptionFormData) {
    try {
      const updates = {
        site: data.site,
        plan: data.plan || '',
      };
      const updated = await subscriptionRepository.updateSubscription(userId, id, updates);
      return { data: updated, error: null };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { data: null, error };
    }
  }

  async deleteSubscription(userId: string, id: string) {
    try {
      await subscriptionRepository.deleteSubscription(userId, id);
      return { error: null };
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return { error };
    }
  }
}

export const subscriptionService = new SubscriptionService();
