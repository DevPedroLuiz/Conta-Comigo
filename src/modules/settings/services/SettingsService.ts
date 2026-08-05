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
    } catch (error: unknown) {
      console.error('Error fetching user data:', error);
      toast.error('Erro ao carregar configurações');
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Ocorreu um erro inesperado.' };
    }
  }

  async updateProfile(userId: string, data: UserProfileUpdate) {
    try {
      await settingsRepository.updateProfile(userId, data);
      return { success: true };
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Ocorreu um erro inesperado.' };
    }
  }

  async updateSettings(userId: string, data: UserSettingsUpdate) {
    try {
      await settingsRepository.updateSettings(userId, data);
      return { success: true };
    } catch (error: unknown) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao atualizar configurações');
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: 'Ocorreu um erro inesperado.' };
    }
  }

  async exportUserData() {
    const { data, error } = await settingsRepository.exportUserData();
    if (error) {
      console.error('Error exporting data:', error);
      throw new Error(error.message);
    }
    return data;
  }
}

export const settingsService = new SettingsService();
