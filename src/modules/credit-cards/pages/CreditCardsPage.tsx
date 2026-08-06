import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard as CreditCardIcon, Plus, ChevronRight } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { creditCardsService } from '../services/CreditCardsService';
import { CreditCard } from '../types';

export function CreditCardsPage() {
  const user = useUser();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    const { data } = await creditCardsService.getCreditCards(user!.id);
    if (data) setCards(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
        <Link
          to="/credit-cards/new"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Cartão
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CreditCardIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Adicione seu primeiro cartão de crédito para gerenciar faturas e planejar seus gastos.
          </p>
          <Link
            to="/credit-cards/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Adicionar Cartão
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={`/credit-cards/${card.id}/invoices`}
              className="group block rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-sm"
              style={{ borderTopWidth: 4, borderTopColor: card.color || '#000000' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{card.name}</h3>
                  <p className="text-sm text-muted-foreground">{card.brand || 'Cartão de Crédito'}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <CreditCardIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Limite Total</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(card.limit || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fechamento / Venc.</span>
                  <span className="font-medium">
                    {card.closing_day} / {card.due_day}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm font-medium text-primary">
                Ver faturas
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
