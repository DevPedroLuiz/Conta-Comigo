import { useState, useEffect } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { reportService } from '../services/ReportService';
import { ReportFilters, CompleteReportData } from '../types/report.types';
import { ReportFiltersComponent } from '../components/ReportFiltersComponent';
import { CashFlowChart } from '../components/CashFlowChart';
import { CategoryBreakdownChart } from '../components/CategoryBreakdownChart';
import { ExportButtons } from '../components/ExportButtons';
import { Spinner } from '../../../core/ui/components/spinner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent } from '../../../core/ui/components/card';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsPage() {
  const user = useUser();
  const [data, setData] = useState<CompleteReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'ALL'
  });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const { data: reportData, error } = await reportService.getReportData(user.id, filters);
      
      if (error) {
        toast.error(error.message || 'Erro ao carregar os relatórios.');
      } else if (reportData) {
        setData(reportData);
      }
      setLoading(false);
    }
    
    loadData();
  }, [user?.id, filters]);

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h2>
        <ExportButtons data={data} startDate={filters.startDate} endDate={filters.endDate} />
      </div>

      <ReportFiltersComponent onFiltersChange={handleFiltersChange} userId={user?.id || ''} />

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : !data ? (
        <div className="flex h-[40vh] items-center justify-center text-muted-foreground">
          Nenhum dado disponível para os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-[#0c0c0e] border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-zinc-400">Total de Receitas</p>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  R$ {data.summary.totalIncome.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0c0c0e] border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-zinc-400">Total de Despesas</p>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  R$ {data.summary.totalExpense.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#0c0c0e] border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-zinc-400">Saldo Líquido</p>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className={`text-2xl font-bold ${data.summary.netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  R$ {data.summary.netBalance.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <CashFlowChart data={data.cashFlow} />
            </div>
            
            {(filters.type === 'ALL' || filters.type === 'EXPENSE') && (
              <CategoryBreakdownChart 
                data={data.expenseByCategory} 
                title="Despesas por Categoria" 
              />
            )}
            
            {(filters.type === 'ALL' || filters.type === 'INCOME') && (
              <CategoryBreakdownChart 
                data={data.incomeByCategory} 
                title="Receitas por Categoria" 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
