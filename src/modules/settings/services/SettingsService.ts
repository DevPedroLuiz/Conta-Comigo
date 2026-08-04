import { settingsRepository } from '../repositories/SettingsRepository';
import { toast } from 'sonner';

export interface UserProfileUpdate {
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
}

export interface UserSettingsUpdate {
  theme?: string;
  language?: string;
  currency?: string;
  date_format?: string;
  first_day_of_week?: number;
}

export class SettingsService {
  async getUserData(userId: string) {
    try {
      const { profile, settings } = await settingsRepository.getProfileAndSettings(userId);
      return { data: { profile, settings } };
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Erro ao carregar configurações');
      return { error };
    }
  }

  async updateProfile(userId: string, data: UserProfileUpdate) {
    try {
      await settingsRepository.updateProfile(userId, data);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
      return { error };
    }
  }

  async updateSettings(userId: string, data: UserSettingsUpdate) {
    try {
      await settingsRepository.updateSettings(userId, data);
      return { success: true };
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
      return { error };
    }
  }
}

export const settingsService = new SettingsService();
