-- Corrige transações que vieram importadas da API como INCOME, 
-- mas são despesas genuínas pertencentes a um Cartão de Crédito.

BEGIN;

UPDATE transactions
SET 
  type = 'EXPENSE',
  amount = ABS(amount) -- Converte para positivo caso tenha vazado algum sinal
WHERE type = 'INCOME'
  AND (
    -- Cenário 1: Já está vinculado a um cartão de crédito no nosso sistema
    credit_card_id IS NOT NULL 
    
    OR 
    
    -- Cenário 2: Pertence a uma account cujo tipo seja explicitamente de cartão
    account_id IN (
        SELECT id FROM accounts WHERE type IN ('CREDIT_CARD', 'credit_card')
    )
  );

-- Opcional (Heurística Fallback): Caso existam contas não mapeadas como crédito, mas os nomes das empresas sejam clássicos de despesa (Uber, iFood, etc).
UPDATE transactions
SET 
  type = 'EXPENSE', 
  amount = ABS(amount)
WHERE type = 'INCOME' 
  AND (
       description ILIKE '%ifood%' 
    OR description ILIKE '%uber%'
    OR description ILIKE '%netflix%'
    OR description ILIKE '%spotify%'
    OR description ILIKE '%pagto fatura%'
  );

COMMIT;
