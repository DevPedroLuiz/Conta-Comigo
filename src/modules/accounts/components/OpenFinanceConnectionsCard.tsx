import React from 'react';
import { RefreshCcw, Zap, CheckCircle2, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { Badge } from '../../../core/ui/components/badge';
import { Button } from '../../../core/ui/components/button';
import { Account } from '../types/account.types';

interface OpenFinanceConnectionsCardProps {
  accounts: Account[];
  onSync?: (itemId: string) => void;
  isSyncing?: boolean;
}

export function OpenFinanceConnectionsCard({ accounts, onSync, isSyncing }: OpenFinanceConnectionsCardProps) {
  const connectedAccounts = accounts.filter(acc => acc.pluggy_item_id);

  if (connectedAccounts.length === 0) {
    return null;
  }

  // Group by item ID to represent distinct institutions/connections
  const connectionsByItem = connectedAccounts.reduce((acc, account) => {
    const itemId = account.pluggy_item_id!;
    if (!acc[itemId]) {
      acc[itemId] = [];
    }
    acc[itemId].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-500" />
          Conexões Open Finance
        </CardTitle>
        <CardDescription>
          Gerencie as sincronizações automáticas de suas contas bancárias.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(connectionsByItem).map(([itemId, itemAccounts]) => {
            // Using the first account's name as a fallback for the institution name
            // In a complete implementation, we might fetch the institution name from Pluggy
            const institutionName = itemAccounts[0].name.split(' ')[0] || 'Instituição';
            
            return (
              <div key={itemId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg bg-card">
                <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{institutionName}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {itemAccounts.length} conta{itemAccounts.length > 1 ? 's' : ''} vinculada{itemAccounts.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Conectado
                      </Badge>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                        <Zap className="w-3 h-3 mr-1" />
                        Atualização Automática
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                  onClick={() => onSync?.(itemId)}
                  disabled={isSyncing}
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
