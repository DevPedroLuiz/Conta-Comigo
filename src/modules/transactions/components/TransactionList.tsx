import { Transaction } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { Skeleton } from '../../../core/ui/components/skeleton';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionList({ transactions, onEdit, onDelete, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="w-full" aria-busy="true" aria-live="polite">
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <RefreshCcw className="h-6 w-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Nenhuma transação encontrada</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
          Você não possui movimentações para este período. Comece adicionando uma nova transação.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50" role="list">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN';
          const isTransfer = tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
          
          const formattedDate = new Date(tx.date).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short'
          });
          
          const formattedAmount = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(Math.abs(Number(tx.amount)));

          return (
            <li key={tx.id} className="group py-3 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors rounded-sm px-2 -mx-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800"
                  aria-hidden="true"
                >
                  {isIncome ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {tx.description}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    {tx.categories?.name || 'Geral'}
                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                    {tx.accounts?.name || '---'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span 
                    className={`text-sm font-medium ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formattedAmount}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formattedDate}
                  </span>
                </div>
                
                {!isTransfer && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      onClick={() => onEdit(tx)}
                      aria-label="Editar transação"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                      onClick={() => onDelete(tx.id)}
                      aria-label="Excluir transação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
