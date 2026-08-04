import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  try {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const { count, error } = await supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    if (error) console.log("accounts error", error);

    const { data: accounts, error: e2 } = await supabase.from('accounts').select('initial_balance').eq('user_id', userId);
    if (e2) console.log("accounts2 error", e2);
    
    const { data: transactions, error: txError } = await supabase.from('transactions').select('amount, type').eq('user_id', userId);
    if (txError) console.log("txError", txError);

    const { data: d1, error: er1 } = await supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'INCOME').gte('date', '2023-01-01').lte('date', '2023-12-31');
    if (er1) console.log("er1", er1);

    const { data: d2, error: er2 } = await supabase.from('transactions').select(`id, description, amount, type, date, categories (name, icon, color)`).eq('user_id', userId).order('date', { ascending: false }).limit(5);
    if (er2) console.log("er2", er2);
    
    const { data: goals, error: ge } = await supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active');
    if (ge) console.log("goals error", ge);

    console.log("Done");
  } catch(e) {
    console.error("Exception:", e);
  }
}
run();
