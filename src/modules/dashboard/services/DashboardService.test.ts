import { goalService } from '../../goals/services/GoalService';
vi.mock('../../goals/services/GoalService', () => ({
  goalService: {
    getGoalsSummary: vi.fn(),
  }
}));
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './DashboardService';
import { dashboardRepository } from '../repositories/DashboardRepository';

// Mock the repository
vi.mock('../repositories/DashboardRepository', () => ({
  dashboardRepository: {
    getCurrentBalance: vi.fn(),
    getMonthlyIncome: vi.fn(),
    getMonthlyExpenses: vi.fn(),
    getRecentTransactions: vi.fn(),
    getExpenseByCategory: vi.fn(),
    getAccountsCount: vi.fn(),
  },
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return complete dashboard data successfully', async () => {
    // Current Balance
    vi.mocked(dashboardRepository.getCurrentBalance).mockResolvedValueOnce(5000);
    
    // Monthly Income (current, previous)
    vi.mocked(dashboardRepository.getMonthlyIncome)
      .mockResolvedValueOnce(3000) // current
      .mockResolvedValueOnce(2000); // previous
      
    // Monthly Expenses (current, previous)
    vi.mocked(dashboardRepository.getMonthlyExpenses)
      .mockResolvedValueOnce(1500) // current
      .mockResolvedValueOnce(1000); // previous

    // Recent Transactions
    const mockTx = [
      { id: '1', description: 'Test', amount: 100, type: 'EXPENSE', date: '2023-01-01', category: { name: 'Food', color: '#000', icon: 'food' } }
    ] as any;
    vi.mocked(dashboardRepository.getRecentTransactions).mockResolvedValueOnce(mockTx);

    // Expense By Category
    const mockExpByCat = [
      { category: 'Food', amount: 1500, color: '#000' }
    ];
    vi.mocked(dashboardRepository.getExpenseByCategory).mockResolvedValueOnce(mockExpByCat);
    vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(3);
    vi.mocked(goalService.getGoalsSummary).mockResolvedValueOnce({ data: { activeGoals: 0, averageProgress: 0, nextToExpire: null }, error: null });

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.error).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.summary.balance).toBe(5000);
    expect(result.data?.summary.monthlyIncome).toBe(3000);
    expect(result.data?.summary.monthlyExpense).toBe(1500);
    
    // Change calc: ((3000 - 2000) / 2000) * 100 = 50%
    expect(result.data?.summary.monthlyIncomeChange).toBe(50);
    // Change calc: ((1500 - 1000) / 1000) * 100 = 50%
    expect(result.data?.summary.monthlyExpenseChange).toBe(50);
    
    expect(result.data?.recentTransactions).toEqual(mockTx);
    expect(result.data?.expensesByCategory).toEqual(mockExpByCat);
  });

  it('should return error if any repository method fails', async () => {
    const error = new Error('Database error');
    vi.mocked(dashboardRepository.getCurrentBalance).mockRejectedValueOnce(error);

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.error).toEqual(error);
  });
  
  it('should handle zero previous values correctly', async () => {
    vi.mocked(dashboardRepository.getCurrentBalance).mockResolvedValueOnce(0);
    vi.mocked(dashboardRepository.getMonthlyIncome)
      .mockResolvedValueOnce(3000)
      .mockResolvedValueOnce(0); 
    vi.mocked(dashboardRepository.getMonthlyExpenses)
      .mockResolvedValueOnce(1500)
      .mockResolvedValueOnce(0); 
    vi.mocked(dashboardRepository.getRecentTransactions).mockResolvedValueOnce([]);
    vi.mocked(dashboardRepository.getExpenseByCategory).mockResolvedValueOnce([]);
    vi.mocked(dashboardRepository.getAccountsCount).mockResolvedValueOnce(0);
    vi.mocked(goalService.getGoalsSummary).mockResolvedValueOnce({ data: { activeGoals: 0, averageProgress: 0, nextToExpire: null }, error: null });

    const result = await dashboardService.getDashboardData('user-1');

    expect(result.error).toBeUndefined();
    expect(result.data?.summary.monthlyIncomeChange).toBe(0);
    expect(result.data?.summary.monthlyExpenseChange).toBe(0);
  });
});
