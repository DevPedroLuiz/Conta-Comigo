import { supabase } from '../../../core/services/supabase';

export interface SyncTransactionData {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface IOpenFinanceProvider {
  getConnectToken(): Promise<string>;
  syncTransactions(itemId: string): Promise<SyncTransactionData[]>;
}

export class PluggySandboxAdapter implements IOpenFinanceProvider {
  async getConnectToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Usuário não autenticado.');
    }

    const response = await fetch('/api/pluggy-token', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connect token');
    }
    const data = await response.json() as { accessToken: string };
    return data.accessToken;
  }

  async syncTransactions(itemId: string): Promise<SyncTransactionData[]> {
    // Simulate network delay for syncing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Return mock transactions
    return [
      {
        id: 'sync_1',
        description: 'Supermercado Sandbox',
        amount: 250.50,
        date: new Date().toISOString(),
        type: 'EXPENSE',
      },
      {
        id: 'sync_2',
        description: 'Salário Sandbox',
        amount: 4500.00,
        date: new Date().toISOString(),
        type: 'INCOME',
      },
      {
        id: 'sync_3',
        description: 'Uber Sandbox',
        amount: 35.90,
        date: new Date().toISOString(),
        type: 'EXPENSE',
      }
    ];
  }
}

class OpenFinanceService {
  constructor(private provider: IOpenFinanceProvider) {}

  async getConnectToken(): Promise<string> {
    return this.provider.getConnectToken();
  }

  async syncTransactions(itemId: string): Promise<SyncTransactionData[]> {
    return this.provider.syncTransactions(itemId);
  }
}

export const openFinanceService = new OpenFinanceService(new PluggySandboxAdapter());
