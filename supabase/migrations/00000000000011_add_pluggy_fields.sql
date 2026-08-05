-- Adicionar colunas na tabela `transactions` para a Pluggy
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS pluggy_transaction_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'POSTED';

-- Adicionar colunas na tabela `accounts` para a Pluggy
ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS pluggy_account_id VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS pluggy_item_id VARCHAR;
