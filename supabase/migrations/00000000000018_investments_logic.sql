-- ==========================================
-- 1. Trigger para Cálculo Automático de Preço Médio e Posição
-- ==========================================
CREATE OR REPLACE FUNCTION update_asset_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_asset RECORD;
    v_new_qty DECIMAL(16,6);
    v_new_avg DECIMAL(12,2);
BEGIN
    -- Busca posição atual do ativo com lock for update para evitar concorrência
    SELECT quantity, average_price INTO v_asset 
    FROM investment_assets 
    WHERE id = NEW.investment_asset_id
    FOR UPDATE;

    IF NEW.movement_type = 'BUY' THEN
        v_new_qty := v_asset.quantity + NEW.quantity;
        -- Média ponderada
        IF v_new_qty > 0 THEN
            v_new_avg := ((v_asset.quantity * v_asset.average_price) + (NEW.quantity * NEW.unit_price)) / v_new_qty;
        ELSE
            v_new_avg := 0;
        END IF;
        
    ELSIF NEW.movement_type = 'SELL' THEN
        v_new_qty := v_asset.quantity - NEW.quantity;
        v_new_avg := v_asset.average_price; -- Venda não altera preço médio contábil
        
        -- Bloqueia short selling não coberto (venda a descoberto) na camada de dados
        IF v_new_qty < 0 THEN
            RAISE EXCEPTION 'Saldo em carteira insuficiente para a venda.';
        END IF;
    END IF;

    -- Atualiza a carteira principal
    UPDATE investment_assets 
    SET quantity = v_new_qty, 
        average_price = v_new_avg,
        updated_at = now()
    WHERE id = NEW.investment_asset_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_update_asset_position ON investment_movements;
CREATE TRIGGER tr_update_asset_position
AFTER INSERT ON investment_movements
FOR EACH ROW EXECUTE FUNCTION update_asset_position();


-- ==========================================
-- 2. RPC Segura para Recebimento de Dividendos (Isolamento)
-- ==========================================
CREATE OR REPLACE FUNCTION register_dividend(
    p_user_id UUID,
    p_asset_id UUID,
    p_account_id UUID,
    p_category_id UUID,
    p_amount DECIMAL,
    p_date DATE,
    p_description TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id UUID;
    v_dividend_id UUID;
BEGIN
    -- Validação básica de autorização
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Não autorizado';
    END IF;

    -- 1. Cria a transação na conta bancária (Fluxo de Caixa)
    INSERT INTO transactions (user_id, type, description, amount, account_id, category_id, date, status)
    VALUES (p_user_id, 'INCOME', p_description, p_amount, p_account_id, p_category_id, p_date, 'PAID')
    RETURNING id INTO v_transaction_id;

    -- 2. Cria o registro de provento atrelado ao ativo (Módulo de Investimentos)
    INSERT INTO dividends (user_id, investment_asset_id, transaction_id, amount, payment_date)
    VALUES (p_user_id, p_asset_id, v_transaction_id, p_amount, p_date)
    RETURNING id INTO v_dividend_id;

    RETURN v_dividend_id;
END;
$$;
