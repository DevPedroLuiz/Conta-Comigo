import { Transaction } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaggerContainer, StaggerItem } from '../../../core/ui/components/StaggerAnimation';
import { AnimatedInteraction } from '../../../core/ui/components/AnimatedInteraction';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border border-border">
      {/* Mobile view (cards) */}
      <StaggerContainer className="block md:hidden divide-y divide-border">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN';
          const isTransfer = tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
          const formattedDate = new Date(tx.date).toLocaleDateString('pt-BR');
          const formattedAmount = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(tx.amount);

          return (
            <StaggerItem key={tx.id} className="p-4 flex flex-col gap-2 bg-card hover:bg-muted/30 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                    style={{ backgroundColor: `${tx.categories?.color || '#888'}20` }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tx.categories?.color || '#888' }} 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.categories?.name || 'Geral'} • {tx.accounts?.name || '---'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {isIncome ? '+' : '-'}{formattedAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
              
              {!isTransfer && (
                <div className="flex justify-end gap-2 mt-2">
                  <AnimatedInteraction>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-muted-foreground"
                      onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                  </AnimatedInteraction>
                  <AnimatedInteraction>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-muted-foreground hover:text-destructive hover:border-destructive"
                      onClick={() => onDelete(tx.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Excluir
                    </Button>
                  </AnimatedInteraction>
                </div>
              )}
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Desktop view (table) */}
      <div className="hidden md:block w-full overflow-x-auto overflow-y-hidden">
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
          <StaggerContainer as="tbody">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME' || tx.type === 'TRANSFER_IN';
              const isTransfer = tx.type === 'TRANSFER_IN' || tx.type === 'TRANSFER_OUT';
              const formattedDate = new Date(tx.date).toLocaleDateString('pt-BR');
              const formattedAmount = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(tx.amount);

              return (
                <StaggerItem as="tr" key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
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
                  <td className={`p-4 align-middle text-right font-medium ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {isIncome ? '+' : '-'}{formattedAmount}
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!isTransfer && (
                        <>
                          <AnimatedInteraction>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => navigate(`/transactions/${tx.id}/edit`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </AnimatedInteraction>
                          <AnimatedInteraction>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive dark:text-red-400"
                              onClick={() => onDelete(tx.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AnimatedInteraction>
                        </>
                      )}
                    </div>
                  </td>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </table>
      </div>
    </div>
  );
}
