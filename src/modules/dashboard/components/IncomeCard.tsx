import { Card, CardContent, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { ArrowUpCircle } from 'lucide-react';

interface IncomeCardProps {
  amount: number;
  change?: number;
}

export function IncomeCard({ amount, change }: IncomeCardProps) {
  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Receitas (Mês)</CardTitle>
        <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedAmount}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive dark:text-red-400"}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>{' '}
            em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
