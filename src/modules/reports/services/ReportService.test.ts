import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportService } from './ReportService';
import { reportRepository } from '../repositories/ReportRepository';

vi.mock('../repositories/ReportRepository', () => ({
  reportRepository: {
    getTransactionsForReport: vi.fn(),
  }
}));

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTx = [
    {
      id: 'tx-1',
      user_id: 'u-1',
      date: '2023-05-01',
      amount: 1000,
      type: 'INCOME',
      category_id: 'cat-1',
      categories: { name: 'Salário', color: '#0f0', icon: 'money' }
    },
    {
      id: 'tx-2',
      user_id: 'u-1',
      date: '2023-05-02',
      amount: 200,
      type: 'EXPENSE',
      category_id: 'cat-2',
      categories: { name: 'Comida', color: '#f00', icon: 'food' }
    },
    {
      id: 'tx-3',
      user_id: 'u-1',
      date: '2023-05-02',
      amount: 100,
      type: 'EXPENSE',
      category_id: 'cat-2',
      categories: { name: 'Comida', color: '#f00', icon: 'food' }
    }
  ] as any;

  it('should process report data successfully', async () => {
    vi.mocked(reportRepository.getTransactionsForReport).mockResolvedValueOnce(mockTx);

    const result = await reportService.getReportData('u-1', {
      startDate: '2023-05-01',
      endDate: '2023-05-31'
    });

    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    
    // Summary
    expect(result.data?.summary.totalIncome).toBe(1000);
    expect(result.data?.summary.totalExpense).toBe(300);
    expect(result.data?.summary.netBalance).toBe(700);

    // Cash flow
    expect(result.data?.cashFlow).toHaveLength(2); // Two unique dates
    expect(result.data?.cashFlow[0].date).toBe('2023-05-01');
    expect(result.data?.cashFlow[0].income).toBe(1000);
    expect(result.data?.cashFlow[1].expense).toBe(300);

    // Expense by category
    expect(result.data?.expenseByCategory).toHaveLength(1);
    expect(result.data?.expenseByCategory[0].categoryId).toBe('cat-2');
    expect(result.data?.expenseByCategory[0].amount).toBe(300);
    expect(result.data?.expenseByCategory[0].percentage).toBe(100);

    // Income by category
    expect(result.data?.incomeByCategory).toHaveLength(1);
    expect(result.data?.incomeByCategory[0].amount).toBe(1000);
    expect(result.data?.incomeByCategory[0].percentage).toBe(100);
  });

  it('should fail if start date is after end date', async () => {
    const result = await reportService.getReportData('u-1', {
      startDate: '2023-05-31',
      endDate: '2023-05-01'
    });

    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect((result.error as Error).message).toBe('A data inicial não pode ser posterior à data final.');
    expect(reportRepository.getTransactionsForReport).not.toHaveBeenCalled();
  });
});
