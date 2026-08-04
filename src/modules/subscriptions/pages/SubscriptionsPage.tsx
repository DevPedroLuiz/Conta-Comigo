import { useEffect, useState } from 'react';
import { Repeat } from 'lucide-react';
import { useUser } from '../../auth/hooks/useAuth';
import { subscriptionService } from '../services/SubscriptionService';
import { Subscription } from '../types';

export function SubscriptionsPage() {
  const user = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user]);

  const loadSubscriptions = async () => {
    const { data } = await subscriptionService.getSubscriptions(user!.id);
    if (data) setSubscriptions(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Assinaturas e Recorrências</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Repeat className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhuma assinatura</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Aqui aparecerão suas assinaturas cadastradas a partir de transações recorrentes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{sub.site}</h3>
                <p className="text-sm text-muted-foreground">{sub.plan}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  Recorrente
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
