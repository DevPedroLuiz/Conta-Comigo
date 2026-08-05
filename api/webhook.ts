import { VercelRequest, VercelResponse } from '@vercel/node';
import { PluggyClient } from 'pluggy-sdk';
import { createClient } from '@supabase/supabase-js';

const PLUGGY_WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLUGGY_CLIENT_ID = process.env.VITE_PLUGGY_CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.VITE_PLUGGY_CLIENT_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Nível 1: Validação de Segurança contra o header x-pluggy-webhook-secret
  const webhookSecret = req.headers['x-pluggy-webhook-secret'] || req.headers['X-Pluggy-Webhook-Secret'];
  if (!PLUGGY_WEBHOOK_SECRET || webhookSecret !== PLUGGY_WEBHOOK_SECRET) {
    console.error('Webhook Inválido: Secret incorreto ou não configurado');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, itemId } = req.body;

  if (!event || !itemId) {
    return res.status(400).json({ error: 'Bad Request: Missing event or itemId' });
  }

  // Apenas processamos eventos que possam afetar transações e saldo
  if (event !== 'TRANSACTION_CREATED' && event !== 'ITEM/UPDATED' && event !== 'transactions/deleted') {
    return res.status(200).json({ message: 'Event ignored' });
  }

  if (!PLUGGY_CLIENT_ID || !PLUGGY_CLIENT_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Erro de configuração: Variáveis de ambiente ausentes');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  try {
    // Usamos o SERVICE_ROLE_KEY para ignorar as restrições RLS em processamento de background
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const pluggyClient = new PluggyClient({
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    });

    // Nível 2: Padrão Fetch-back
    // Em vez de usar os dados do payload, que poderiam ser falsificados ou incompletos, 
    // nós fazemos uma chamada segura de volta para a API da Pluggy.
    
    // Obter todas as contas associadas ao item atualizado
    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const accounts = accountsResponse.results;

    for (const pluggyAccount of accounts) {
      // Procurar a conta no Supabase usando o ID da Pluggy
      const { data: dbAccount, error: accountError } = await supabase
        .from('accounts')
        .select('id, user_id')
        .eq('pluggy_account_id', pluggyAccount.id)
        .single();

      if (accountError || !dbAccount) {
        // Se a conta não existe ainda ou não foi sincronizada, não podemos inserir a transação.
        console.warn(`Account ${pluggyAccount.id} not found in database. Skipping.`);
        continue;
      }

      // Buscar transações reais da conta diretamente da Pluggy
      const transactionsResponse = await pluggyClient.fetchTransactions(pluggyAccount.id);
      const transactions = transactionsResponse.results;

      // Buscar a categoria padrão "Outros" ou de "Despesa" daquele usuário
      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', dbAccount.user_id)
        .eq('type', 'EXPENSE')
        .limit(1)
        .single();

      for (const pluggyTx of transactions) {
         const amountValue = pluggyTx.amount;
         
         // A regra do nosso banco exige amount > 0, e type como 'INCOME' ou 'EXPENSE'.
         // Na Pluggy, despesas são valores negativos e receitas valores positivos.
         const isExpense = amountValue < 0;
         const finalAmount = Math.abs(amountValue);
         
         // Prevenindo inserir amount 0 se houver restrição
         if (finalAmount === 0) continue;

         const type = isExpense ? 'EXPENSE' : 'INCOME';

         const newTx = {
            user_id: dbAccount.user_id,
            account_id: dbAccount.id,
            category_id: defaultCategory?.id || null, // Tratamento caso não tenha categoria
            type: type,
            description: pluggyTx.description || 'Transação Importada',
            amount: finalAmount,
            date: pluggyTx.date.substring(0, 10), // Apenas 'YYYY-MM-DD'
            pluggy_transaction_id: pluggyTx.id,
            status: pluggyTx.status || 'POSTED'
         };

         // Realiza o Upsert. Se a transação já existir pelo pluggy_transaction_id, ele atualiza,
         // caso contrário, ele insere sem duplicar registros.
         const { error: upsertError } = await supabase
          .from('transactions')
          .upsert(newTx, { onConflict: 'pluggy_transaction_id' });
          
         if (upsertError) {
             console.error(`Erro ao inserir transação ${pluggyTx.id}:`, upsertError);
         }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro geral no Webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
