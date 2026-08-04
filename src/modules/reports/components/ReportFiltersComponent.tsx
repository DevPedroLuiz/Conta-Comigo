import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../core/ui/components/card';
import { Label } from '../../../core/ui/components/label';
import { Input } from '../../../core/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { ReportFilters } from '../types/report.types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '../../../core/services/supabase';

interface ReportFiltersProps {
  onFiltersChange: (filters: ReportFilters) => void;
  userId: string;
}

export function ReportFiltersComponent({ onFiltersChange, userId }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'ALL',
    categoryId: 'all',
    accountId: 'all'
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchFilterOptions() {
      const { data: catData } = await supabase.from('categories').select('id, name').eq('user_id', userId);
      const { data: accData } = await supabase.from('accounts').select('id, name').eq('user_id', userId);
      
      if (catData) setCategories(catData);
      if (accData) setAccounts(accData);
    }
    fetchFilterOptions();
  }, [userId]);

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange({
      ...newFilters,
      categoryId: newFilters.categoryId === 'all' ? undefined : newFilters.categoryId,
      accountId: newFilters.accountId === 'all' ? undefined : newFilters.accountId
    });
  };

  return (
    <Card className="bg-[#0c0c0e] border-zinc-800 mb-6">
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label className="text-zinc-400">Data Inicial</Label>
          <Input 
            type="date" 
            value={filters.startDate} 
            onChange={(e) => handleFilterChange('startDate', e.target.value)} 
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">Data Final</Label>
          <Input 
            type="date" 
            value={filters.endDate} 
            onChange={(e) => handleFilterChange('endDate', e.target.value)} 
            className="bg-zinc-900 border-zinc-800"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">Tipo</Label>
          <Select value={filters.type} onValueChange={(val) => handleFilterChange('type', val)}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">Conta</Label>
          <Select value={filters.accountId} onValueChange={(val) => handleFilterChange('accountId', val)}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">Categoria</Label>
          <Select value={filters.categoryId} onValueChange={(val) => handleFilterChange('categoryId', val)}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
