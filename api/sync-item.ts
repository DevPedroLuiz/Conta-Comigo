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

  // Verificar o usuário autenticado através do Authorization header
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

    // Option 1: Triggers an item update via Pluggy SDK (if available) and we fetch transactions immediately
    // Or just fetch transactions assuming they are already updated
    // According to Pluggy documentation, updateItem forces a sync if the item allows it.
    // However, if it's already syncing we might just fetch the current ones.
    
    // As instructed: "Utilizar a PluggyClient para forçar a atualização ou buscar as transações atualizadas daquele item e salvá-las no Supabase (fazendo o mesmo upsert seguro que já usamos no webhook)."
    
    // Obter todas as contas associadas ao item atualizado
    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const accounts = accountsResponse.results;
    
    let totalSynced = 0;

    for (const pluggyAccount of accounts) {
      // Procurar a conta no Supabase usando o ID da Pluggy e confirmando que pertence ao usuário
      const { data: dbAccount, error: accountError } = await supabase
        .from('accounts')
        .select('id, user_id')
        .eq('pluggy_account_id', pluggyAccount.id)
        .eq('user_id', user.id)
        .single();

      if (accountError || !dbAccount) {
        console.warn(`Account ${pluggyAccount.id} not found in database for user ${user.id}. Skipping.`);
        continue;
      }

      // Buscar transações da conta na Pluggy
      const transactionsResponse = await pluggyClient.fetchTransactions(pluggyAccount.id);
      const transactions = transactionsResponse.results;

      // Buscar a categoria padrão
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

    return res.status(200).json({ success: true, message: `Sincronização concluída. ${totalSynced} transações processadas.` });

  } catch (error) {
    console.error('Erro na sincronização manual:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
