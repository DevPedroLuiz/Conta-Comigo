import { supabase } from '../../../core/services/supabase';

export class OnboardingRepository {
  async hasSettings(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('settings')
      .select('user_id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) return false;
    return (data && data.length > 0);
  }

  async saveProfile(userId: string, profileData: any) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  async saveSettings(userId: string, settingsData: any) {
    const { error } = await supabase.from('settings').upsert({
      user_id: userId,
      ...settingsData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
  }

  async createAccount(accountData: any) {
    const { data: existing } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', accountData.user_id)
      .limit(1);

    if (existing && existing.length > 0) {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          name: accountData.name,
          type: accountData.type,
          initial_balance: accountData.initial_balance,
          color: accountData.color,
          icon: accountData.icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase.from('accounts').insert(accountData).select().single();
      if (error) throw error;
      return data;
    }
  }

  async createCategories(categoriesData: any[]) {
    if (!categoriesData.length) return;
    const userId = categoriesData[0].user_id;
    
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Categories already exist, skip to prevent duplicates
      return;
    }

    const { error } = await supabase.from('categories').insert(categoriesData);
    if (error) throw error;
  }
}

export const onboardingRepository = new OnboardingRepository();
