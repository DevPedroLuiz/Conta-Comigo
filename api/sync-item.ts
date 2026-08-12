import { VercelRequest, VercelResponse } from '@vercel/node';
import { PluggyClient } from 'pluggy-sdk';
import { createClient } from '@supabase/supabase-js';
import { TransactionClassificationEngine } from '../src/modules/transactions/services/TransactionClassificationEngine';

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

    const authResponse = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: PLUGGY_CLIENT_ID,
        clientSecret: PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!authResponse.ok) {
      console.error('Failed to authenticate with Pluggy API');
      return res.status(500).json({ error: 'Failed to authenticate with Pluggy' });
    }

    const { apiKey: pluggyApiKey } = await authResponse.json();

    const pluggyClient = new PluggyClient({
      clientId: PLUGGY_CLIENT_ID,
      clientSecret: PLUGGY_CLIENT_SECRET,
    });

    const accountsResponse = await pluggyClient.fetchAccounts(itemId);
    const accounts = accountsResponse.results;
    console.log('[AUDITORIA] 2. Contas recebidas da Pluggy:', accounts);
    
    let totalSynced = 0;

    for (const pluggyAccount of accounts) {
      const isCreditCard = pluggyAccount.type === 'CREDIT' || pluggyAccount.subtype === 'CREDIT_CARD';
      
      let targetAccountId = null;
      let targetCreditCardId = null;

      if (isCreditCard) {
        // Upsert no credit_cards
        const creditData: any = pluggyAccount.creditData || {};
        
        let closingDay = 1;
        if (creditData.balanceCloseDate) {
          const parsed = new Date(creditData.balanceCloseDate).getDate();
          if (!isNaN(parsed)) closingDay = parsed;
        }

        let dueDay = 10;
        if (creditData.balanceDueDate) {
          const parsed = new Date(creditData.balanceDueDate).getDate();
          if (!isNaN(parsed)) dueDay = parsed;
        }
        
        const newCreditCard = {
          user_id: user.id,
          name: pluggyAccount.name || 'Cartão Sincronizado',
          limit: creditData.creditLimit || 0,
          closing_day: closingDay,
          due_day: dueDay,
          brand: creditData.brand || 'Outro',
          color: '#4f46e5',
          pluggy_account_id: pluggyAccount.id,
          pluggy_item_id: itemId
        };

        const { data: dbCard, error: cardError } = await supabase
          .from('credit_cards')
          .upsert(newCreditCard, { onConflict: 'pluggy_account_id' })
          .select('id, user_id')
          .single();

        if (cardError || !dbCard) {
          console.error(`Erro ao inserir/atualizar cartão ${pluggyAccount.id}:`, cardError);
          continue;
        }
        
        targetCreditCardId = dbCard.id;
      } else {
        const subtypeMapping: Record<string, string> = {
          'CHECKING_ACCOUNT': 'CHECKING_ACCOUNT',
          'SAVINGS_ACCOUNT': 'SAVINGS_ACCOUNT',
        };
        const accountType = subtypeMapping[pluggyAccount.subtype] || 'CHECKING_ACCOUNT';

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
        
        targetAccountId = dbAccount.id;
      }

      const transactionsResponse = await fetch(`https://api.pluggy.ai/v2/transactions?accountId=${pluggyAccount.id}`, {
        headers: {
          'X-API-KEY': pluggyApiKey
        }
      });

      if (!transactionsResponse.ok) {
        console.error(`Failed to fetch transactions for account ${pluggyAccount.id} from v2 API`);
        continue;
      }

      const transactionsData = await transactionsResponse.json();
      const transactions = transactionsData.results || [];

      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .in('name', ['Outros', 'Sem Categoria'])
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
         
         if (finalAmount === 0) continue;
         
         const type = isExpense ? 'EXPENSE' : 'INCOME';
         
         const classification = TransactionClassificationEngine.classify(
            pluggyTx.description || '',
            type
         );
         
         const finalType = classification.type || type;
         
         const mappedStatus = pluggyTx.status === 'PENDING' ? 'UNPAID' : 'PAID';
         
         const newTx = {
            user_id: user.id,
            account_id: targetAccountId,
            credit_card_id: targetCreditCardId,
            category_id: defaultCategory?.id || null,
            type: finalType,
            description: pluggyTx.description || 'Transação Importada',
            amount: finalAmount,
            date: new Date(pluggyTx.date).toISOString().substring(0, 10),
            pluggy_transaction_id: pluggyTx.id,
            status: mappedStatus,
            is_internal_transfer: classification.is_internal_transfer,
            is_subscription: classification.is_subscription,
            is_investment: classification.is_investment
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

    console.log("[AUDITORIA] 4. Sincronizando Investimentos");
    const investmentsResponse = await fetch(`https://api.pluggy.ai/investments?itemId=${itemId}`, {
      headers: { "X-API-KEY": pluggyApiKey }
    });
    if (investmentsResponse.ok) {
      const investmentsData = await investmentsResponse.json();
      if (investmentsData.results) {
        for (const inv of investmentsData.results) {
          let type = "STOCK";
          if (inv.type === "FIXED_INCOME") type = "CDB";
          else if (inv.type === "MUTUAL_FUND") type = "FII";
          const ticker = inv.code || inv.name || `INV-${inv.id.substring(0,6)}`;
          const quantity = inv.quantity || 1;
          const currentPrice = inv.value || inv.balance || 0;
          const averagePrice = (inv.value || inv.balance || 0) / quantity;
          const { error: invError } = await supabase
            .from("investment_assets")
            .upsert({
              user_id: user.id,
              ticker: ticker,
              name: inv.name || "Investimento Sincronizado",
              type: type,
              quantity: quantity,
              average_price: averagePrice,
              current_price: currentPrice,
              updated_at: new Date().toISOString()
            }, { onConflict: "user_id,ticker" });
          if (invError) console.error(`Erro ao inserir investimento ${ticker}:`, invError);
        }
      }
    }
    console.log("[AUDITORIA] 5. Detectando Assinaturas");
    const { data: recentTxs } = await supabase
      .from("transactions")
      .select("description, amount, type")
      .eq("user_id", user.id)
      .eq("type", "EXPENSE")
      .order("date", { ascending: false })
      .limit(100);
    if (recentTxs) {
      const frequencyMap = new Map();
      recentTxs.forEach(tx => {
        const key = `${tx.description}-${tx.amount}`;
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      });
      for (const [key, count] of frequencyMap.entries()) {
        if (count >= 2) {
          const [description, amountStr] = key.split("-");
          const amount = parseFloat(amountStr);
          await supabase
            .from("subscriptions")
            .upsert({
              user_id: user.id,
              name: description,
              amount: amount,
              frequency: "MONTHLY",
              status: "ACTIVE",
              due_day: 1
            }, { onConflict: "user_id,name" });
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
