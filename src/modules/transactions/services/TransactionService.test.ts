import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from './TransactionService';
import { transactionRepository, referenceRepository } from '../repositories/TransactionRepository';

vi.mock('../repositories/TransactionRepository', () => ({
  transactionRepository: {
    getTransactions: vi.fn(),
    getTransactionById: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
  referenceRepository: {
    getAccounts: vi.fn(),
    getCategories: vi.fn(),
  }
}));

describe('TransactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData: any = {
    type: 'INCOME',
    description: 'Salário',
    amount: 5000,
    category_id: 'cat-1',
    account_id: 'acc-1',
    date: '2023-10-01',
    notes: ''
  };

  it('should successfully create an INCOME transaction', async () => {
    vi.mocked(transactionRepository.createTransaction).mockResolvedValueOnce({ id: 'tx-1', user_id: 'user-1', ...validData });
    const result = await transactionService.createTransaction('user-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data?.id).toBe('tx-1');
    expect(transactionRepository.createTransaction).toHaveBeenCalledWith({
      user_id: 'user-1',
      ...validData
    });
  });

  it('should successfully create an EXPENSE transaction', async () => {
    const expenseData = { ...validData, type: 'EXPENSE', amount: 150 };
    vi.mocked(transactionRepository.createTransaction).mockResolvedValueOnce({ id: 'tx-2', user_id: 'user-1', ...expenseData });
    const result = await transactionService.createTransaction('user-1', expenseData as any);
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('tx-2');
    expect(transactionRepository.createTransaction).toHaveBeenCalledWith({
      user_id: 'user-1',
      ...expenseData
    });
  });

  it('should block creation of transaction with zero amount', async () => {
    const invalidData = { ...validData, amount: 0 };
    const result = await transactionService.createTransaction('user-1', invalidData as any);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('O valor da transação deve ser maior que zero.');
    expect(transactionRepository.createTransaction).not.toHaveBeenCalled();
  });

  it('should block creation of transaction with negative amount', async () => {
    const invalidData = { ...validData, amount: -100 };
    const result = await transactionService.createTransaction('user-1', invalidData as any);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('O valor da transação deve ser maior que zero.');
    expect(transactionRepository.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle repository error on creation', async () => {
    const dbError = new Error('Database Error');
    vi.mocked(transactionRepository.createTransaction).mockRejectedValueOnce(dbError);
    
    const result = await transactionService.createTransaction('user-1', validData);
    
    expect(result.data).toBeNull();
    expect(result.error).toBe(dbError);
  });

  it('should successfully update a transaction', async () => {
    vi.mocked(transactionRepository.updateTransaction).mockResolvedValueOnce({ id: 'tx-1', user_id: 'user-1', ...validData });
    const result = await transactionService.updateTransaction('user-1', 'tx-1', validData);
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('tx-1');
    expect(transactionRepository.updateTransaction).toHaveBeenCalledWith('user-1', 'tx-1', {
      type: validData.type,
      description: validData.description,
      amount: validData.amount,
      category_id: validData.category_id,
      account_id: validData.account_id,
      date: validData.date,
      notes: validData.notes
    });
  });

  it('should successfully delete a transaction', async () => {
    vi.mocked(transactionRepository.deleteTransaction).mockResolvedValueOnce();
    const result = await transactionService.deleteTransaction('user-1', 'tx-1');
    
    expect(result.error).toBeNull();
    expect(transactionRepository.deleteTransaction).toHaveBeenCalledWith('user-1', 'tx-1');
  });

  it('should get transaction by id', async () => {
    vi.mocked(transactionRepository.getTransactionById).mockResolvedValueOnce({ id: 'tx-1', user_id: 'user-1', ...validData });
    const result = await transactionService.getTransactionById('user-1', 'tx-1');
    
    expect(result.error).toBeNull();
    expect(result.data?.id).toBe('tx-1');
    expect(transactionRepository.getTransactionById).toHaveBeenCalledWith('user-1', 'tx-1');
  });
});
