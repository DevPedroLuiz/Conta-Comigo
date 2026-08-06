-- ==========================================
-- 1. Criação de Tabela Leve de Eventos (Event Sourcing Pattern)
-- Objetivo: Evitar vazamento de dados sensíveis da tabela principal de transactions
-- ==========================================
CREATE TABLE IF NOT EXISTS transaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para garantir Tenant Isolation (Escuta Indevida)
ALTER TABLE transaction_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own transaction events" ON transaction_events;
CREATE POLICY "Users can view their own transaction events" 
ON transaction_events FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- 2. Trigger para Popular a Tabela de Eventos
-- ==========================================
CREATE OR REPLACE FUNCTION log_transaction_event() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO transaction_events (transaction_id, user_id, action)
    VALUES (OLD.id, OLD.user_id, TG_OP);
    RETURN OLD;
  ELSE
    INSERT INTO transaction_events (transaction_id, user_id, action)
    VALUES (NEW.id, NEW.user_id, TG_OP);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS tr_transaction_events ON transactions;
CREATE TRIGGER tr_transaction_events
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION log_transaction_event();

-- ==========================================
-- 3. Habilitar o Broadcast APENAS na Tabela de Eventos
-- ==========================================
-- Removemos a tabela transactions original do realtime (caso estivesse) de forma segura
-- e adicionamos apenas a tabela de eventos.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.transactions;
    END IF;
END
$$;

-- Garante que a tabela de eventos está na publication (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'transaction_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transaction_events;
    END IF;
END
$$;

-- ==========================================
-- 4. Função de Limpeza (Opcional, para não inchar o BD)
-- ==========================================
-- Exclui eventos mais antigos que 24 horas, pois o realtime é efêmero
CREATE OR REPLACE FUNCTION cleanup_stale_events() 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM transaction_events WHERE created_at < now() - interval '24 hours';
END;
$$;
