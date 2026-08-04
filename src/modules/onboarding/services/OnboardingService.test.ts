import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onboardingService } from './OnboardingService';
import { onboardingRepository } from '../repositories/OnboardingRepository';
import { OnboardingData } from '../schemas/onboarding.schemas';

// Mock the repository
vi.mock('../repositories/OnboardingRepository', () => ({
  onboardingRepository: {
    saveProfile: vi.fn(),
    saveSettings: vi.fn(),
    createAccount: vi.fn(),
    createCategories: vi.fn(),
  },
}));

describe('OnboardingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData: OnboardingData = {
    currency: 'BRL',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    firstDayOfWeek: '0',
    theme: 'system',
    fullName: 'John Doe',
    avatar: 'avatar.png',
    timezone: 'America/Sao_Paulo',
    accountName: 'Carteira',
    accountType: 'WALLET',
    initialBalance: 1000,
    accountColor: '#000000',
    accountIcon: 'wallet',
    categories: [
      { name: 'Alimentação', type: 'EXPENSE', is_default: true, color: '#ff0000', icon: 'food' }
    ],
  };

  it('should complete onboarding successfully and call repository methods', async () => {
    vi.mocked(onboardingRepository.saveSettings).mockResolvedValueOnce(undefined);
    vi.mocked(onboardingRepository.saveProfile).mockResolvedValueOnce(undefined);
    vi.mocked(onboardingRepository.createAccount).mockResolvedValueOnce({ id: 'acc1' });
    vi.mocked(onboardingRepository.createCategories).mockResolvedValueOnce(undefined);

    const result = await onboardingService.completeOnboarding('user-1', mockData);

    expect(onboardingRepository.saveSettings).toHaveBeenCalledWith('user-1', {
      currency: 'BRL',
      language: 'pt-BR',
      date_format: 'DD/MM/YYYY',
      first_day_of_week: '0',
      theme: 'system',
    });

    expect(onboardingRepository.saveProfile).toHaveBeenCalledWith('user-1', {
      full_name: 'John Doe',
      timezone: 'America/Sao_Paulo',
      avatar_url: 'avatar.png',
    });

    expect(onboardingRepository.createAccount).toHaveBeenCalledWith({
      user_id: 'user-1',
      name: 'Carteira',
      type: 'WALLET',
      initial_balance: 1000,
      color: '#000000',
      icon: 'wallet',
    });

    expect(onboardingRepository.createCategories).toHaveBeenCalledWith([
      {
        user_id: 'user-1',
        name: 'Alimentação',
        type: 'EXPENSE', is_default: true,
        color: '#ff0000',
        icon: 'food',
      }
    ]);

    expect(result).toEqual({ success: true });
  });

  it('should return error if any repository method fails', async () => {
    const error = new Error('Database error');
    vi.mocked(onboardingRepository.saveSettings).mockRejectedValueOnce(error);

    const result = await onboardingService.completeOnboarding('user-1', mockData);

    expect(result).toEqual({ error });
  });
});
