import { reportRepository } from '../repositories/ReportRepository';
import { ReportFilters, CompleteReportData, CashFlowData, CategorySummaryData, ReportSummary } from '../types/report.types';
import { Transaction } from '../../transactions/types/transaction.types';

export class ReportService {
  async getReportData(userId: string, filters: ReportFilters): Promise<{ data?: CompleteReportData; error?: any }> {
    try {
      if (new Date(filters.startDate) > new Date(filters.endDate)) {
        throw new Error('A data inicial não pode ser posterior à data final.');
      }

      const transactions = await reportRepository.getTransactionsForReport(userId, filters);

      let totalIncome = 0;
      let totalExpense = 0;

      const cashFlowMap = new Map<string, { income: number; expense: number }>();
      const incomeCategoryMap = new Map<string, { amount: number; name: string; color: string }>();
      const expenseCategoryMap = new Map<string, { amount: number; name: string; color: string }>();

      transactions.forEach((tx) => {
        const dateKey = tx.date;
        const amount = Number(tx.amount);
        
        if (!cashFlowMap.has(dateKey)) {
          cashFlowMap.set(dateKey, { income: 0, expense: 0 });
        }
        
        const flow = cashFlowMap.get(dateKey)!;

        const catId = tx.category_id || 'unknown';
        const catName = tx.categories?.name || 'Sem categoria';
        const catColor = tx.categories?.color || '#cbd5e1';

        if (tx.type === 'INCOME') {
          totalIncome += amount;
          flow.income += amount;
          
          if (!incomeCategoryMap.has(catId)) {
            incomeCategoryMap.set(catId, { amount: 0, name: catName, color: catColor });
          }
          incomeCategoryMap.get(catId)!.amount += amount;
        } else {
          totalExpense += amount;
          flow.expense += amount;
          
          if (!expenseCategoryMap.has(catId)) {
            expenseCategoryMap.set(catId, { amount: 0, name: catName, color: catColor });
          }
          expenseCategoryMap.get(catId)!.amount += amount;
        }
      });

      const cashFlow: CashFlowData[] = Array.from(cashFlowMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, { income, expense }]) => ({
          date,
          income,
          expense,
          balance: income - expense,
        }));

      const processCategoryMap = (map: Map<string, any>, total: number): CategorySummaryData[] => {
        if (total === 0) return [];
        return Array.from(map.entries())
          .map(([categoryId, data]) => ({
            categoryId,
            categoryName: data.name,
            amount: data.amount,
            color: data.color,
            percentage: (data.amount / total) * 100
          }))
          .sort((a, b) => b.amount - a.amount);
      };

      const incomeByCategory = processCategoryMap(incomeCategoryMap, totalIncome);
      const expenseByCategory = processCategoryMap(expenseCategoryMap, totalExpense);

      const summary: ReportSummary = {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense
      };

      return {
        data: {
          summary,
          cashFlow,
          incomeByCategory,
          expenseByCategory,
          transactions
        }
      };
    } catch (error: any) {
      console.error('Error getting report data:', error);
      return { error };
    }
  }
}

export const reportService = new ReportService();
