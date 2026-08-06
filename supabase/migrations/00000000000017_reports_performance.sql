-- ==========================================
-- 1. Criação da Materialized View de Consolidação
-- ==========================================
-- Agrupamos o total de receitas/despesas por usuário, categoria e mês
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_cashflow_summary AS
SELECT 
    user_id,
    category_id,
    type,
    DATE_TRUNC('month', date::timestamp) AS month_date,
    SUM(amount) AS total_amount,
    COUNT(id) AS transaction_count
FROM 
    transactions
GROUP BY 
    user_id, category_id, type, DATE_TRUNC('month', date::timestamp);

-- ==========================================
-- 2. Índices para Otimização da View
-- ==========================================
-- O índice UNIQUE é obrigatório para permitir o REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_cashflow_unique 
ON monthly_cashflow_summary (user_id, category_id, type, month_date);

CREATE INDEX IF NOT EXISTS idx_monthly_cashflow_user_month 
ON monthly_cashflow_summary (user_id, month_date);

-- ==========================================
-- 3. Função de Atualização
-- ==========================================
CREATE OR REPLACE FUNCTION refresh_monthly_cashflow_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- O CONCURRENTLY permite ler os dados antigos enquanto a view é atualizada, 
    -- evitando travar o Dashboard (locks)
    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_cashflow_summary;
END;
$$;

-- O agendamento seria feito via extensão pg_cron (se habilitada no ambiente Supabase)
-- SELECT cron.schedule('refresh_cashflow_15m', '*/15 * * * *', 'SELECT refresh_monthly_cashflow_summary()');
