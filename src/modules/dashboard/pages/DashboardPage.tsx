import { useUser } from '../../auth/hooks/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { BalanceCard } from '../components/BalanceCard';
import { IncomeCard } from '../components/IncomeCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { RecentTransactions } from '../components/RecentTransactions';
import { ExpenseChart } from '../components/ExpenseChart';
import { GoalsSummaryCard } from '../components/GoalsSummaryCard';
import { Skeleton } from '../../../core/ui/components/skeleton';

export function DashboardPage() {
  const user = useUser();
  const { data, isLoading, isError } = useDashboardData(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-10">
          <Skeleton className="h-[300px] col-span-1 md:col-span-3 lg:col-span-4" />
          <Skeleton className="h-[300px] col-span-1 md:col-span-3 lg:col-span-3" />
          <Skeleton className="h-[300px] col-span-1 md:col-span-3 lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Ocorreu um erro ao carregar os dados do dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BalanceCard balance={data.summary.balance} investmentsTotal={data.investmentsTotal} accountsCount={data.summary.accountsCount} />
        <IncomeCard amount={data.summary.monthlyIncome} change={data.summary.monthlyIncomeChange} />
        <ExpenseCard amount={data.summary.monthlyExpense} change={data.summary.monthlyExpenseChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-10">
        <div className="col-span-1 md:col-span-3 lg:col-span-4">
          <ExpenseChart data={data.expensesByCategory} />
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <GoalsSummaryCard summary={data.goalsSummary} />
        </div>
        <div className="col-span-1 md:col-span-3 lg:col-span-3">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </div>
  );
}
