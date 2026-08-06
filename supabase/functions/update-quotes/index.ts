import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const brapiToken = Deno.env.get("BRAPI_TOKEN");

serve(async (req) => {
  try {
    // Segurança: Garantir que a chamada partiu de um CRON ou sistema interno (via headers/secrets)
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Inicializa o cliente do Supabase usando Service Role (bypass RLS para rotina sistêmica)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Busca todos os tickers distintos dos ativos (ações e FIIs)
    const { data: assets, error } = await supabaseClient
      .from('investment_assets')
      .select('ticker')
      .in('type', ['STOCK', 'FII', 'ETF']); // Filtra os ativos de bolsa
      
    if (error) throw error;
    
    // Extrai tickers únicos para não sobrecarregar a API
    const uniqueTickers = [...new Set(assets.map(a => a.ticker))];
    if (uniqueTickers.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum ativo para atualizar" }), { status: 200 });
    }

    // 2. Chama a API Externa em Lote (Batch)
    // APIs como a Brapi permitem passar múltiplos tickers (ex: PETR4%2CVALE3)
    const tickersString = uniqueTickers.join('%2C');
    const response = await fetch(`https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`);
    
    if (!response.ok) {
      throw new Error('Falha ao buscar cotações da API externa');
    }
    
    const apiData = await response.json();
    
    // 3. Atualiza os preços no banco em paralelo
    const updates = apiData.results.map((result: any) => {
      return supabaseClient
        .from('investment_assets')
        .update({ 
          current_price: result.regularMarketPrice,
          updated_at: new Date().toISOString()
        })
        .eq('ticker', result.symbol);
    });

    await Promise.all(updates);

    return new Response(
      JSON.stringify({ success: true, updated_tickers: updates.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
