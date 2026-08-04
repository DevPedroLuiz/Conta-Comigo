import { describe, it, expect, vi, beforeEach } from 'vitest';
import { accountService } from './AccountService';
import { accountRepository } from '../repositories/AccountRepository';

vi.mock('../repositories/AccountRepository', () => ({
  accountRepository: {
    getAccounts: vi.fn(),
    getAccountById: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    getTotalBalance: vi.fn(),
  }
}));

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData: any = {
    name: 'Banco Teste',
    type: 'CHECKING_ACCOUNT',
    initial_balance: 1000,
    currency: 'BRL',
  };

  it('should successfully create an account', async () => {
    vi.mocked(accountRepository.createAccount).mockResolvedValueOnce({ id: 'acc-1', user_id: 'user-1', ...validData });
    const result = await accountService.createAccount('user-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('acc-1');
    expect(accountRepository.createAccount).toHaveBeenCalledWith({
      user_id: 'user-1',
      ...validData
    });
  });

  it('should handle invalid initial balance on creation', async () => {
    const invalidData = { ...validData, initial_balance: 'not a number' };
    const result = await accountService.createAccount('user-1', invalidData as any);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('Saldo inicial inválido.');
    expect(accountRepository.createAccount).not.toHaveBeenCalled();
  });

  it('should handle repository error on creation', async () => {
    const dbError = new Error('Database Error');
    vi.mocked(accountRepository.createAccount).mockRejectedValueOnce(dbError);
    
    const result = await accountService.createAccount('user-1', validData);
    
    expect(result.data).toBeNull();
    expect(result.error).toBe(dbError);
  });

  it('should successfully update an account', async () => {
    vi.mocked(accountRepository.updateAccount).mockResolvedValueOnce({ id: 'acc-1', user_id: 'user-1', ...validData });
    const result = await accountService.updateAccount('user-1', 'acc-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('acc-1');
    expect(accountRepository.updateAccount).toHaveBeenCalledWith('user-1', 'acc-1', validData);
  });

  it('should successfully delete an account', async () => {
    vi.mocked(accountRepository.deleteAccount).mockResolvedValueOnce();
    const result = await accountService.deleteAccount('user-1', 'acc-1');
    
    expect(result.error).toBeNull();
    expect(accountRepository.deleteAccount).toHaveBeenCalledWith('user-1', 'acc-1');
  });

  it('should return financial summary', async () => {
    vi.mocked(accountRepository.getAccounts).mockResolvedValueOnce([
      { id: 'acc-1', user_id: 'user-1', ...validData }
    ]);
    vi.mocked(accountRepository.getTotalBalance).mockResolvedValueOnce(5000);
    
    const result = await accountService.getFinancialSummary('user-1');
    
    expect(result.error).toBeNull();
    expect(result.data?.totalBalance).toBe(5000);
    expect(result.data?.accountsCount).toBe(1);
    expect(result.data?.accounts).toHaveLength(1);
  });
});
