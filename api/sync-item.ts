import { VercelRequest, VercelResponse } from '@vercel/node';
import { PluggyClient } from 'pluggy-sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLUGGY_CLIENT_ID = process.env.VITE_PLUGGY_CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.VITE_PLUGGY_CLIENT_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { itemId } = req.body;
  if (!itemId) {
    return res.status(400).json({ error: 'Missing itemId' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET) {
    console.error('Configuração ausente:', {
      hasSupabaseUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
      hasPluggyId: !!PLUGGY_CLIENT_ID,
      hasPluggySecret: !!PLUGGY_CLIENT_SECRET
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const pluggyClient = new PluggyClient({
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    });

    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const accounts = accountsResponse.results;
    console.log('[AUDITORIA] 2. Contas recebidas da Pluggy:', accounts);
    
    let totalSynced = 0;

    for (const pluggyAccount of accounts) {
      const typeMapping: Record<string, string> = {
        'CHECKING': 'CHECKING_ACCOUNT',
        'SAVINGS': 'SAVINGS_ACCOUNT',
        'CREDIT': 'CREDIT_CARD'
      };
      const accountType = typeMapping[pluggyAccount.type] || 'CHECKING_ACCOUNT';

      const newAccount = {
        user_id: user.id,
        name: pluggyAccount.name || 'Conta Sincronizada',
        type: accountType,
        initial_balance: 0,
        current_balance: pluggyAccount.balance || 0,
        currency: pluggyAccount.currencyCode || 'BRL',
        pluggy_account_id: pluggyAccount.id,
        pluggy_item_id: itemId
      };

      const { data: dbAccount, error: accountError } = await supabase
        .from('accounts')
        .upsert(newAccount, { onConflict: 'pluggy_account_id' })
        .select('id, user_id')
        .single();

      if (accountError || !dbAccount) {
        console.error(`Erro ao inserir/atualizar conta ${pluggyAccount.id}:`, accountError);
        continue;
      }

      const transactionsResponse = await pluggyClient.fetchTransactions(pluggyAccount.id);
      const transactions = transactionsResponse.results;

      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', dbAccount.user_id)
        .eq('type', 'EXPENSE')
        .limit(1)
        .single();

      for (const pluggyTx of transactions) {
         const amountValue = pluggyTx.amount;
         const isExpense = amountValue < 0;
         const finalAmount = Math.abs(amountValue);
         
         if (finalAmount === 0) continue;
         
         const type = isExpense ? 'EXPENSE' : 'INCOME';
         
         const newTx = {
            user_id: dbAccount.user_id,
            account_id: dbAccount.id,
            category_id: defaultCategory?.id || null,
            type: type,
            description: pluggyTx.description || 'Transação Importada',
            amount: finalAmount,
            date: new Date(pluggyTx.date).toISOString().substring(0, 10),
            pluggy_transaction_id: pluggyTx.id,
            status: pluggyTx.status || 'POSTED'
         };

         const { error: upsertError } = await supabase
          .from('transactions')
          .upsert(newTx, { onConflict: 'pluggy_transaction_id' });
           
         if (upsertError) {
             console.error(`Erro ao inserir transação ${pluggyTx.id}:`, upsertError);
         } else {
             totalSynced++;
         }
      }
    }

    console.log('[AUDITORIA] 3. Inserção no Supabase concluída');

    return res.status(200).json({ success: true, message: `Sincronização concluída. ${totalSynced} transações processadas.` });

  } catch (error) {
    console.error('Erro na sincronização manual:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
