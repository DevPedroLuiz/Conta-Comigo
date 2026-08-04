import { Transaction } from '../repositories/DashboardRepository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Você ainda não possui transações.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Suas últimas movimentações financeiras.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'INCOME';
            return (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div 
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${transaction.category.color}20` }}
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="h-5 w-5" style={{ color: transaction.category.color }} />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5" style={{ color: transaction.category.color }} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className={`font-medium ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
                  {isIncome ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(transaction.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
