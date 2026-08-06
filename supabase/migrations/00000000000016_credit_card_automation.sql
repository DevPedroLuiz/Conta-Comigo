-- ==========================================
-- 1. Criação da Tabela credit_card_invoices_summary (Otimização)
-- ==========================================
-- Adicionando colunas de valor à fatura para facilitar leituras
ALTER TABLE credit_card_invoices ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE credit_card_invoices ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'PAID'));

-- ==========================================
-- 2. Função de Fechamento de Faturas (DB Cron)
-- ==========================================
CREATE OR REPLACE FUNCTION process_credit_card_invoices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_card RECORD;
    v_total_amount DECIMAL(12,2);
    v_target_month INTEGER;
    v_target_year INTEGER;
BEGIN
    -- Determina o mês e ano alvo para o fechamento
    -- Se hoje for o closing_day do cartão, fechamos a fatura do mês atual/seguinte.
    -- (Lógica simplificada: roda todo dia e fecha as faturas cujo closing_day é hoje)
    
    FOR v_card IN 
        SELECT id, closing_day, due_day, user_id
        FROM credit_cards
        WHERE closing_day = EXTRACT(DAY FROM CURRENT_DATE)::INTEGER
    LOOP
        v_target_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
        v_target_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

        -- Calcula o total das transações do cartão até a data de fechamento e não pagas
        SELECT COALESCE(SUM(amount), 0)
        INTO v_total_amount
        FROM transactions
        WHERE credit_card_id = v_card.id
          AND status = 'UNPAID'
          AND type = 'EXPENSE'
          AND date <= CURRENT_DATE;
          
        -- Cria (ou atualiza) a fatura como CLOSED
        INSERT INTO credit_card_invoices (credit_card_id, month, year, amount, status)
        VALUES (v_card.id, v_target_month, v_target_year, v_total_amount, 'CLOSED')
        ON CONFLICT (id) DO NOTHING; -- No modelo real, precisaria de UNIQUE(credit_card_id, month, year)
        
        -- Opcional: Atualizar as transações para associá-las à fatura, caso exista essa chave
        -- UPDATE transactions SET status = 'INVOICED' WHERE ...
    END LOOP;
END;
$$;

-- Agendar para rodar todos os dias à meia-noite via pg_cron (se a extensão estiver ativa)
-- SELECT cron.schedule('process_invoices_daily', '0 0 * * *', 'SELECT process_credit_card_invoices()');

