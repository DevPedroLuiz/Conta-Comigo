import { Transaction } from '../../transactions/types/transaction.types';
import { Category } from '../../categories/types/category.types';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: 'INCOME' | 'EXPENSE' | 'ALL';
  categoryId?: string;
  accountId?: string;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummaryData {
  categoryId: string;
  categoryName: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface CompleteReportData {
  summary: ReportSummary;
  cashFlow: CashFlowData[];
  incomeByCategory: CategorySummaryData[];
  expenseByCategory: CategorySummaryData[];
  transactions: (Transaction & { category?: Category })[];
}
