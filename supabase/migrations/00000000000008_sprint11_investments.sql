-- Update transactions type to support transfers
DO $$
DECLARE
    c_name text;
BEGIN
    SELECT conname INTO c_name
    FROM pg_constraint
    WHERE conrelid = 'transactions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%type %' OR pg_get_constraintdef(oid) LIKE '%INCOME%';
      
    IF c_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE transactions DROP CONSTRAINT ' || c_name;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore if error
END $$;

ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER_IN', 'TRANSFER_OUT', 'income', 'expense', 'transfer_in', 'transfer_out'));

-- Create Investments (Brokers/Wallets)
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    broker TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Investment Assets
CREATE TABLE IF NOT EXISTS investment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('STOCK', 'FII', 'ETF', 'CRYPTO', 'FIXED_INCOME', 'TREASURY', 'OTHER')),
    quantity DECIMAL(16,6) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    average_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Investment Movements
CREATE TABLE IF NOT EXISTS investment_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investment_asset_id UUID NOT NULL REFERENCES investment_assets(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    movement_type VARCHAR NOT NULL CHECK (movement_type IN ('BUY', 'SELL')),
    quantity DECIMAL(16,6) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    fees DECIMAL(12,2) DEFAULT 0,
    taxes DECIMAL(12,2) DEFAULT 0,
    movement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Dividends
CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investment_asset_id UUID NOT NULL REFERENCES investment_assets(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON investments(user_id);
CREATE INDEX IF NOT EXISTS investment_assets_investment_id_idx ON investment_assets(investment_id);
CREATE INDEX IF NOT EXISTS investment_assets_user_id_idx ON investment_assets(user_id);
CREATE INDEX IF NOT EXISTS investment_movements_user_id_idx ON investment_movements(user_id);
CREATE INDEX IF NOT EXISTS investment_movements_asset_id_idx ON investment_movements(investment_asset_id);
CREATE INDEX IF NOT EXISTS investment_movements_transaction_id_idx ON investment_movements(transaction_id);
CREATE INDEX IF NOT EXISTS dividends_user_id_idx ON dividends(user_id);
CREATE INDEX IF NOT EXISTS dividends_asset_id_idx ON dividends(investment_asset_id);
CREATE INDEX IF NOT EXISTS dividends_transaction_id_idx ON dividends(transaction_id);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investments" ON investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investments" ON investments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investments" ON investments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own investment assets" ON investment_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investment assets" ON investment_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own investment assets" ON investment_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investment assets" ON investment_assets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own investment movements" ON investment_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own investment movements" ON investment_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own investment movements" ON investment_movements FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own dividends" ON dividends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dividends" ON dividends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dividends" ON dividends FOR DELETE USING (auth.uid() = user_id);
