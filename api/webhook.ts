import { VercelRequest, VercelResponse } from '@vercel/node';
import { PluggyClient } from 'pluggy-sdk';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const PLUGGY_WEBHOOK_SECRET = process.env.PLUGGY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PLUGGY_CLIENT_ID = process.env.VITE_PLUGGY_CLIENT_ID;
const PLUGGY_CLIENT_SECRET = process.env.VITE_PLUGGY_CLIENT_SECRET;

// Zod Schema for Webhook Payload
const WebhookPayloadSchema = z.object({
  event: z.string({ message: 'Event is required' }),
  itemId: z.string({ message: 'itemId is required' }),
}).passthrough(); // allows other fields but requires these

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

  // Nível 2: Validação da estrutura do Payload via Zod
  const validation = WebhookPayloadSchema.safeParse(req.body);
  if (!validation.success) {
    console.error('Webhook Payload Inválido:', validation.error.format());
    return res.status(400).json({ error: 'Bad Request: Invalid Payload', details: validation.error.format() });
  }

  const { event, itemId } = validation.data;

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

    // Padrão Fetch-back
    // Em vez de usar os dados do payload, que poderiam ser falsificados ou incompletos, 
    // nós fazemos uma chamada segura de volta para a API da Pluggy.
    
    // Obter todas as contas associadas ao item atualizado
    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const accounts = accountsResponse.results;

    for (const pluggyAccount of accounts) {
      let targetAccountId = null;
      let targetCreditCardId = null;
      let targetUserId = null;
      let isCreditCard = false;

      // Primeiro procura em accounts
      const { data: dbAccount } = await supabase
        .from('accounts')
        .select('id, user_id, type')
        .eq('pluggy_account_id', pluggyAccount.id)
        .single();

      if (dbAccount) {
         targetAccountId = dbAccount.id;
         targetUserId = dbAccount.user_id;
         isCreditCard = dbAccount.type === 'CREDIT_CARD' || dbAccount.type === 'credit_card';
      } else {
         // Tenta em credit_cards se não encontrar em accounts
         const { data: dbCreditCard } = await supabase
           .from('credit_cards')
           .select('id, user_id')
           .eq('pluggy_account_id', pluggyAccount.id)
           .single();
           
         if (dbCreditCard) {
            targetCreditCardId = dbCreditCard.id;
            targetUserId = dbCreditCard.user_id;
            isCreditCard = true;
         } else {
            console.warn(`Account ${pluggyAccount.id} not found in database. Skipping.`);
            continue;
         }
      }

      // Buscar transações reais da conta diretamente da Pluggy
      const transactionsResponse = await pluggyClient.fetchTransactions(pluggyAccount.id);
      const transactions = transactionsResponse.results;

      // Buscar categorias padrão para INCOME e EXPENSE para aquele usuário
      const { data: expenseCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('type', 'EXPENSE')
        .limit(1)
        .single();
        
      const { data: incomeCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('type', 'INCOME')
        .limit(1)
        .single();

      for (const pluggyTx of transactions) {
         const amountValue = pluggyTx.amount;
         
         let isExpense = amountValue < 0;
         if (pluggyTx.type === 'DEBIT') {
             isExpense = true;
         } else if (pluggyTx.type === 'CREDIT') {
             isExpense = false;
         } else if (isCreditCard) {
             isExpense = amountValue > 0;
         }

         const finalAmount = Math.abs(amountValue);
         
         // Prevenindo inserir amount 0 se houver restrição
         if (finalAmount === 0) continue;

         const type = isExpense ? 'EXPENSE' : 'INCOME';
         
         // Usa a categoria correspondente ao tipo correto, evitando classificar INCOME como EXPENSE
         const categoryId = type === 'EXPENSE' ? expenseCategory?.id : incomeCategory?.id;

         const mappedStatus = pluggyTx.status === 'PENDING' ? 'UNPAID' : 'PAID';

         const newTx = {
            user_id: targetUserId,
            account_id: targetAccountId,
            credit_card_id: targetCreditCardId,
            category_id: categoryId || null,
            type: type,
            description: pluggyTx.description || 'Transação Importada',
            amount: finalAmount,
            date: new Date(pluggyTx.date).toISOString().substring(0, 10), // Apenas 'YYYY-MM-DD'
            pluggy_transaction_id: pluggyTx.id,
            status: mappedStatus
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
