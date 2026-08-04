import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { TransactionType } from '../types/transaction.types';

interface TransactionFiltersProps {
  type: TransactionType | 'ALL';
  onChangeType: (type: TransactionType | 'ALL') => void;
  // Can add more filters like category, date here if needed
}

export function TransactionFilters({ type, onChangeType }: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-[200px]">
        <Select value={type} onValueChange={(val) => onChangeType(val as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de transação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value="INCOME">Receitas</SelectItem>
            <SelectItem value="EXPENSE">Despesas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
