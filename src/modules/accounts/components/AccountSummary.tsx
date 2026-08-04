import { FinancialSummary } from '../types/account.types';

interface AccountSummaryProps {
  summary: FinancialSummary;
}

export function AccountSummary({ summary }: AccountSummaryProps) {
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(summary.totalBalance);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Patrimônio Total</h3>
        <p className={`text-3xl font-bold ${summary.totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive dark:text-red-400'}`}>
          {formattedBalance}
        </p>
      </div>
      <div className="p-6 rounded-lg border border-border bg-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Quantidade de contas</h3>
        <p className="text-3xl font-bold text-muted-foreground">
          {summary.accountsCount}
        </p>
      </div>
    </div>
  );
}
