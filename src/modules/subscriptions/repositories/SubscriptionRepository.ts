import { supabase } from '../../../core/services/supabase';
import { Subscription } from '../types';

export class SubscriptionRepository {
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Subscription[];
  }

  async getSubscriptionById(userId: string, id: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Subscription;
  }

  async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();
    if (error) throw error;
    return data as Subscription;
  }

  async updateSubscription(userId: string, id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Subscription;
  }

  async deleteSubscription(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }

  async createRecurrence(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('transaction_recurrences')
      .insert({ user_id: userId })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }
}

export const subscriptionRepository = new SubscriptionRepository();
