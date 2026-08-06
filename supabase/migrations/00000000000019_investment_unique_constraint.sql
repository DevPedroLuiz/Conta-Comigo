-- Adiciona a constraint UNIQUE composta (user_id, ticker)
ALTER TABLE public.investment_assets ADD CONSTRAINT investment_assets_user_ticker_key UNIQUE (user_id, ticker);
