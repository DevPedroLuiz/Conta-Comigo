import { Transaction } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-border">
      <div className="w-full overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Data</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Descrição</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Categoria</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Conta</th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Valor</th>
              <th className="h-10 px-4 text-center font-medium text-muted-foreground w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const formattedDate = new Date(tx.date).toLocaleDateString('pt-BR');
              const formattedAmount = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(tx.amount);

              return (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4 align-middle whitespace-nowrap">{formattedDate}</td>
                  <td className="p-4 align-middle font-medium">{tx.description}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: tx.categories?.color || '#888' }} 
                      />
                      {tx.categories?.name || 'Geral'}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{tx.accounts?.name || '---'}</td>
                  <td className={`p-4 align-middle text-right font-medium ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {isIncome ? '+' : '-'}{formattedAmount}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive dark:text-red-400"
                        onClick={() => onDelete(tx.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
