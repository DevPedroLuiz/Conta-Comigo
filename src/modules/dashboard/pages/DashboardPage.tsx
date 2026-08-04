import { useEffect, useState } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { dashboardService, DashboardData } from '../services/DashboardService';
import { BalanceCard } from '../components/BalanceCard';
import { IncomeCard } from '../components/IncomeCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { RecentTransactions } from '../components/RecentTransactions';
import { ExpenseChart } from '../components/ExpenseChart';
import { GoalsSummaryCard } from '../components/GoalsSummaryCard';
import { Spinner } from '../../../core/ui/components/spinner';
import { toast } from 'sonner';

export function DashboardPage() {
  const user = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      setLoading(true);
      const { data: dashboardData, error } = await dashboardService.getDashboardData(user.id);
      
      if (error) {
        toast.error('Erro ao carregar os dados do dashboard.');
      } else if (dashboardData) {
        setData(dashboardData);
      }
      setLoading(false);
    }
    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        Nenhum dado disponível.
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
