import { Card, CardContent, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { Wallet, TrendingUp } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  investmentsTotal?: number;
  currency?: string;
  accountsCount?: number;
}

export function BalanceCard({ balance, investmentsTotal = 0, currency = 'R$', accountsCount }: BalanceCardProps) {
  const totalPatrimony = balance + investmentsTotal;
  
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalPatrimony);

  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(balance);

  const formattedInvestments = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(investmentsTotal);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedTotal}</div>
        
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Saldo Disponível
            </span>
            <span className="font-medium">{formattedBalance}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Investimentos
            </span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{formattedInvestments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
