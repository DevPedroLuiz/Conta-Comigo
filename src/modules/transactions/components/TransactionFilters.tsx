import { TransactionType } from '../types/transaction.types';
import { Button } from '../../../core/ui/components/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionFiltersProps {
  type: TransactionType | 'ALL';
  onChangeType: (type: TransactionType | 'ALL') => void;
  currentDate: Date;
  onChangeDate: (date: Date) => void;
}

export function TransactionFilters({ type, onChangeType, currentDate, onChangeDate }: TransactionFiltersProps) {
  const handlePrevMonth = () => onChangeDate(subMonths(currentDate, 1));
  const handleNextMonth = () => onChangeDate(addMonths(currentDate, 1));

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center justify-between w-full sm:w-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-1 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevMonth}
          className="h-8 w-8 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </Button>
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize min-w-[120px] text-center">
          {monthLabel}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextMonth}
          className="h-8 w-8 rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </Button>
      </div>

      <div className="flex items-center w-full sm:w-auto bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-md">
        <FilterTab 
          active={type === 'ALL'} 
          onClick={() => onChangeType('ALL')} 
          label="Todas" 
        />
        <FilterTab 
          active={type === 'INCOME'} 
          onClick={() => onChangeType('INCOME')} 
          label="Receitas" 
        />
        <FilterTab 
          active={type === 'EXPENSE'} 
          onClick={() => onChangeType('EXPENSE')} 
          label="Despesas" 
        />
      </div>
    </div>
  );
}

function FilterTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-all flex-1 sm:flex-none ${
        active 
          ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50' 
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
