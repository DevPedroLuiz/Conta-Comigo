import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../core/ui/components/dialog';
import { Button } from '../../../core/ui/components/button';
import { parseOFX, parseCSV, ParsedTransaction } from '../utils/ofxParser';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { transactionService } from '../services/TransactionService';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { referenceRepository } from '../repositories/TransactionRepository';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../core/ui/components/select';
import { Label } from '../../../core/ui/components/label';
import { toast } from 'sonner';

interface ImportTransactionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTransactionsModal({ open, onOpenChange }: ImportTransactionsModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { data: formRefs } = useQuery({
    queryKey: ['transaction-form-refs', user?.id],
    queryFn: () => transactionService.getFormData(user!.id),
    enabled: !!user,
  });

  const accounts = formRefs?.data?.accounts || [];
  const categories = formRefs?.data?.categories || [];
  const defaultCategory = categories.find(c => c.type === 'EXPENSE') || categories[0];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    try {
      let transactions: ParsedTransaction[] = [];
      if (file.name.toLowerCase().endsWith('.ofx')) {
        transactions = parseOFX(text);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        transactions = await parseCSV(text);
      } else {
        toast.error('Formato não suportado. Envie um arquivo .ofx ou .csv.');
        return;
      }
      setParsedData(transactions);
      
      // Auto-select first account if none selected
      if (!selectedAccountId && accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
      if (!selectedCategoryId && defaultCategory) {
        setSelectedCategoryId(defaultCategory.id);
      }
    } catch (error) {
      toast.error('Erro ao processar o arquivo.');
      console.error(error);
    }
  };

  const handleImport = async () => {
    if (!user || !selectedAccountId) return;
    setIsLoading(true);

    const payload = parsedData.map(tx => ({
      user_id: user.id,
      account_id: selectedAccountId,
      category_id: selectedCategoryId || defaultCategory?.id,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      status: 'POSTED',
      pluggy_transaction_id: tx.fitId || null,
    }));

    const { error } = await transactionService.importBatchTransactions(user.id, payload);

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${parsedData.length} transações importadas com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setParsedData([]);
    setSelectedAccountId('');
    setSelectedCategoryId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) resetAndClose(); else onOpenChange(val); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Transações</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo .ofx ou .csv do seu banco para importar transações automaticamente.
          </DialogDescription>
        </DialogHeader>

        {parsedData.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ofx,.csv"
              className="hidden"
              onChange={handleChange}
            />
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-center mb-1">
              Arraste e solte seu arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              ou clique para selecionar do seu computador (OFX, CSV)
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Selecionar Arquivo
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Arquivo processado com sucesso</p>
                <p className="text-xs text-primary/80">{parsedData.length} transações encontradas prontas para importação.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Conta de Destino</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria Padrão</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md max-h-48 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-medium">Data</th>
                    <th className="px-4 py-2 font-medium">Descrição</th>
                    <th className="px-4 py-2 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parsedData.slice(0, 50).map((tx, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-4 py-2 whitespace-nowrap">{tx.date}</td>
                      <td className="px-4 py-2 truncate max-w-[200px]">{tx.description}</td>
                      <td className={`px-4 py-2 text-right whitespace-nowrap ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <div className="text-xs text-center p-2 text-muted-foreground border-t bg-muted/30">
                  Mostrando as primeiras 50 transações...
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={resetAndClose}>Cancelar</Button>
          {parsedData.length > 0 && (
            <Button onClick={handleImport} disabled={!selectedAccountId || isLoading}>
              {isLoading ? 'Importando...' : 'Confirmar Importação'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
