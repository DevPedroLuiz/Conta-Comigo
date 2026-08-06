import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, Circle, Eye } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { creditCardsService } from '../services/CreditCardsService';
import { CreditCard, CreditCardInvoice } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../core/ui/components/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../core/ui/components/sheet';
import { referenceRepository } from '../../transactions/repositories/TransactionRepository';
import { toast } from 'sonner';
import { StaggerContainer, StaggerItem } from '../../../core/ui/components/StaggerAnimation';
import { AnimatedInteraction } from '../../../core/ui/components/AnimatedInteraction';

export function CreditCardInvoicesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  
  const [card, setCard] = useState<CreditCard | null>(null);
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [payingInvoice, setPayingInvoice] = useState<CreditCardInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<CreditCardInvoice | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  const loadData = async () => {
    if (!user || !id) return;
    setLoading(true);
    const [cardRes, invoicesRes, accountsRes] = await Promise.all([
      creditCardsService.getCreditCardById(user.id, id),
      creditCardsService.getInvoices(user.id, id),
      referenceRepository.getAccounts(user.id)
    ]);

    if (cardRes.data) setCard(cardRes.data);
    if (invoicesRes.data) setInvoices(invoicesRes.data as any[]);
    if (accountsRes) setAccounts(accountsRes);
    setLoading(false);
  };

  const handlePayInvoice = async () => {
    if (!user || !payingInvoice || !selectedAccountId) return;
    setIsPaying(true);
    const date = new Date().toISOString().split('T')[0];
    const amount = payingInvoice.total_amount || 0;
    
    await creditCardsService.payInvoice(user.id, payingInvoice.id, selectedAccountId, amount, date);
    
    setPayingInvoice(null);
    setIsPaying(false);
    toast.success('Fatura paga com sucesso!');
    loadData();
  };

  const handleToggleStatus = async (invoice: any) => {
    const currentStatus = invoice.status || 'OPEN';
    const { error } = await creditCardsService.toggleInvoiceStatus(invoice.id, currentStatus);
    if (error) {
      toast.error('Erro ao atualizar status da fatura');
    } else {
      toast.success(`Fatura marcada como ${currentStatus === 'PAID' ? 'Em aberto' : 'Paga'}!`);
      loadData();
    }
  };

  if (loading) {
    return <div className="space-y-4 p-8 text-center text-muted-foreground">Carregando faturas...</div>;
  }

  if (!card) {
    return <div className="p-8 text-center text-muted-foreground">Cartão não encontrado.</div>;
  }

  const getMonthName = (month: number) => {
    const name = new Date(2000, month - 1, 15).toLocaleString('pt-BR', { month: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <AnimatedInteraction>
          <button
            onClick={() => navigate('/credit-cards')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </AnimatedInteraction>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faturas - {card.name}</h1>
          <p className="text-sm text-muted-foreground">Vencimento: dia {card.due_day}</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhuma fatura encontrada</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            As faturas aparecerão aqui conforme as despesas forem lançadas neste cartão.
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice: any) => {
            const isPaid = invoice.status === 'PAID';
            return (
            <StaggerItem key={invoice.id} className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between">
              <div className="mb-4 flex justify-between items-start">
                <span className="text-lg font-medium">
                  {getMonthName(invoice.month)} {invoice.year}
                </span>
                <AnimatedInteraction>
                  <button
                    onClick={() => handleToggleStatus(invoice)}
                    title={isPaid ? "Marcar como Em Aberto" : "Marcar como Paga"}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    {isPaid ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-green-500/50" />
                    )}
                  </button>
                </AnimatedInteraction>
              </div>
              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${isPaid ? 'text-muted-foreground' : 'text-destructive'}`}>
                    R$ {(invoice.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {isPaid ? 'Paga' : 'Em aberto'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {!isPaid && (
                    <AnimatedInteraction className="w-full">
                      <button
                        onClick={() => setPayingInvoice(invoice)}
                        className="w-full rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Pagar Fatura
                      </button>
                    </AnimatedInteraction>
                  )}
                  <AnimatedInteraction className="w-full">
                    <button
                      onClick={() => setViewingInvoice(invoice)}
                      className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </button>
                  </AnimatedInteraction>
                </div>
              </div>
            </StaggerItem>
          )})}
        </StaggerContainer>
      )}

      <Dialog open={!!payingInvoice} onOpenChange={(open) => !open && setPayingInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Fatura</DialogTitle>
            <DialogDescription>
              Fatura de {payingInvoice ? getMonthName(payingInvoice.month) : ''} no valor de R$ {(Math.abs(payingInvoice?.total_amount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta de Pagamento</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-foreground appearance-none"
              >
                <option value="" className="text-muted-foreground">Selecione uma conta...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="text-foreground">{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setPayingInvoice(null)}
              className="rounded-full px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              disabled={isPaying}
            >
              Cancelar
            </button>
            <button
              onClick={handlePayInvoice}
              disabled={!selectedAccountId || isPaying}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPaying ? 'Pagando...' : 'Confirmar Pagamento'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Detalhes da Fatura</SheetTitle>
            <SheetDescription>
              {viewingInvoice ? `${getMonthName(viewingInvoice.month)} ${viewingInvoice.year}` : ''}
            </SheetDescription>
          </SheetHeader>

          {viewingInvoice?.transactions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-2xl bg-muted/30">
              <p>Nenhuma transação registrada nesta fatura.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {viewingInvoice?.transactions?.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center p-4 border rounded-2xl bg-card">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{tx.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
