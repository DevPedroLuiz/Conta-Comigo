import { Account } from '../types/account.types';
import { Button } from '../../../core/ui/components/button';
import { Pencil, Trash2, Landmark, Wallet, Banknote, LineChart, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedInteraction } from '../../../core/ui/components/AnimatedInteraction';

interface AccountCardProps {
  key?: string | number;
  account: Account;
  onDelete: (id: string) => void;
}

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'CHECKING_ACCOUNT': return <Landmark className="h-5 w-5 text-muted-foreground" />;
    case 'SAVINGS_ACCOUNT': return <Wallet className="h-5 w-5 text-emerald-400" />;
    case 'CASH': return <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case 'INVESTMENT': return <LineChart className="h-5 w-5 text-blue-400" />;
    case 'CREDIT_CARD': return <CreditCard className="h-5 w-5 text-purple-400" />;
    default: return <Wallet className="h-5 w-5 text-muted-foreground" />;
  }
};

const getAccountTypeName = (type: string) => {
  switch (type) {
    case 'CHECKING_ACCOUNT': return 'Conta Corrente';
    case 'SAVINGS_ACCOUNT': return 'Conta Poupança';
    case 'CASH': return 'Dinheiro';
    case 'INVESTMENT': return 'Investimento';
    case 'CREDIT_CARD': return 'Cartão de Crédito';
    default: return 'Conta';
  }
};

export function AccountCard({ account, onDelete }: AccountCardProps) {
  const navigate = useNavigate();
  
  const formattedBalance = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: account.currency || 'BRL',
  }).format(account.current_balance);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-border transition-colors">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/50">
          {getAccountIcon(account.type)}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{account.name}</h3>
          <p className="text-sm text-muted-foreground">{getAccountTypeName(account.type)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        <div className="text-right">
          <p className={`font-semibold text-lg ${account.current_balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive dark:text-red-400'}`}>
            {formattedBalance}
          </p>
        </div>
        
        <div className="flex gap-2">
          <AnimatedInteraction>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/accounts/${account.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </AnimatedInteraction>
          <AnimatedInteraction>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive dark:text-red-400"
              onClick={() => onDelete(account.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AnimatedInteraction>
        </div>
      </div>
    </div>
  );
}
