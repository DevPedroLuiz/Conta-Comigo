import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '🚨 ERRO CRÍTICO: Variáveis de ambiente do Supabase ausentes.\n' +
    'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar configuradas.\n' +
    'A aplicação não conseguirá acessar o banco de dados.'
  );
  
  // Objeto mockado para evitar tela branca (crashing) durante o carregamento inicial do AuthProvider
  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase não configurado') }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    // Outros métodos retornarão falhas caso sejam chamados
    from: () => ({
      select: () => ({
        eq: () => ({
          limit: () => ({ data: null, error: new Error('Supabase não configurado') })
        })
      })
    })
  };
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client as SupabaseClient;
