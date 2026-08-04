import { supabase } from '../../../core/services/supabase';

export class SettingsRepository {
  async getProfileAndSettings(userId: string) {
    const [profileRes, settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('settings').select('*').eq('user_id', userId).single()
    ]);
    
    if (profileRes.error) console.error('Error fetching profile:', profileRes.error);
    if (settingsRes.error) console.error('Error fetching settings:', settingsRes.error);

    return {
      profile: profileRes.data,
      settings: settingsRes.data
    };
  }

  async updateProfile(userId: string, data: any) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
  }

  async updateSettings(userId: string, data: any) {
    const { error } = await supabase
      .from('settings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export const settingsRepository = new SettingsRepository();
