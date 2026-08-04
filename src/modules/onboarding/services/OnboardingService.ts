import { onboardingRepository } from '../repositories/OnboardingRepository';
import { OnboardingData } from '../schemas/onboarding.schemas';

export class OnboardingService {
  async checkOnboardingStatus(userId: string): Promise<boolean> {
    try {
      return await onboardingRepository.hasSettings(userId);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  async completeOnboarding(userId: string, data: OnboardingData) {
    try {
      // 1. Save settings
      await onboardingRepository.saveSettings(userId, {
        currency: data.currency,
        language: data.language,
        date_format: data.dateFormat,
        first_day_of_week: data.firstDayOfWeek,
        theme: data.theme,
      });

      // 2. Save profile
      await onboardingRepository.saveProfile(userId, {
        full_name: data.fullName,
        timezone: data.timezone,
        avatar_url: data.avatar,
      });

      // 3. Create initial account
      await onboardingRepository.createAccount({
        user_id: userId,
        name: data.accountName,
        type: data.accountType,
        initial_balance: data.initialBalance,
        color: data.accountColor,
        icon: data.accountIcon,
      });

      // 4. Create default categories
      if (data.categories && data.categories.length > 0) {
        const categoriesData = data.categories.map((c) => ({
          user_id: userId,
          name: c.name,
          type: c.type,
          color: c.color,
          icon: c.icon,
          is_default: true,
        }));
        await onboardingRepository.createCategories(categoriesData);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      return { error };
    }
  }
}

export const onboardingService = new OnboardingService();
