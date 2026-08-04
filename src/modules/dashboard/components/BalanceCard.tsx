import { Card, CardContent, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  accountsCount?: number;
}

export function BalanceCard({ balance, currency = 'R$', accountsCount }: BalanceCardProps) {
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(balance);

  // In a real scenario we'd use the chosen currency for formatting, 
  // but we're keeping it simple and using BRL format as a placeholder.

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedBalance}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {accountsCount !== undefined ? `Quantidade de contas: ${accountsCount}` : 'Soma de todas as suas contas'}
        </p>
      </CardContent>
    </Card>
  );
}
