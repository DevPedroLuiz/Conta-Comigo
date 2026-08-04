import { toast } from "sonner";
import { dashboardRepository, DashboardSummary, Transaction, ExpenseByCategory } from '../repositories/DashboardRepository';
import { goalService } from '../../goals/services/GoalService';
import { GoalsSummary } from '../../goals/types/goal.types';
import { investmentService } from '../../investments/services/InvestmentService';

export interface DashboardData {
  summary: DashboardSummary;
  recentTransactions: Transaction[];
  expensesByCategory: ExpenseByCategory[];
  goalsSummary?: GoalsSummary | null;
  investmentsTotal?: number;
}

export class DashboardService {
  async getDashboardData(userId: string): Promise<{ data?: DashboardData; error?: any }> {
    try {
      const now = new Date();
      
      // Current month date range
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      
      // Previous month date range (for variation if needed)
      const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const [
        balance,
        currentIncome,
        currentExpense,
        previousIncome,
        previousExpense,
        recentTransactions,
        expensesByCategory,
        accountsCount,
        goalsResult,
        investmentsResult
      ] = await Promise.all([
        dashboardRepository.getCurrentBalance(userId),
        dashboardRepository.getMonthlyIncome(userId, firstDayCurrentMonth, lastDayCurrentMonth),
        dashboardRepository.getMonthlyExpenses(userId, firstDayCurrentMonth, lastDayCurrentMonth),
        dashboardRepository.getMonthlyIncome(userId, firstDayPreviousMonth, lastDayPreviousMonth),
        dashboardRepository.getMonthlyExpenses(userId, firstDayPreviousMonth, lastDayPreviousMonth),
        dashboardRepository.getRecentTransactions(userId),
        dashboardRepository.getExpenseByCategory(userId, firstDayCurrentMonth, lastDayCurrentMonth),
        dashboardRepository.getAccountsCount(userId),
        goalService.getGoalsSummary(userId),
        investmentService.getSummary(userId)
      ]);

      let incomeChange = 0;
      if (previousIncome > 0) {
        incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
      }

      let expenseChange = 0;
      if (previousExpense > 0) {
        expenseChange = ((currentExpense - previousExpense) / previousExpense) * 100;
      }

      const summary: DashboardSummary = {
        balance,
        monthlyIncome: currentIncome,
        monthlyExpense: currentExpense,
        monthlyIncomeChange: incomeChange,
        monthlyExpenseChange: expenseChange,
        accountsCount,
      };

      return {
        data: {
          summary,
          recentTransactions,
          expensesByCategory,
          goalsSummary: goalsResult?.data || null,
          investmentsTotal: investmentsResult?.data?.current_total_value || 0
        }
      };
    } catch (error: any) {
      console.error('Error fetching dashboard data:', JSON.stringify(error, null, 2));
      toast.error(`Dashboard err: ${error?.message || JSON.stringify(error)}`);
      return { error };
    }
  }
}

export const dashboardService = new DashboardService();
