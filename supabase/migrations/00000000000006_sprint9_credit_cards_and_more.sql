-- transaction_installments
CREATE TABLE IF NOT EXISTS transaction_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    installments_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transaction_installments_user_id_idx ON transaction_installments(user_id);

-- transaction_recurrences
CREATE TABLE IF NOT EXISTS transaction_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transaction_recurrences_user_id_idx ON transaction_recurrences(user_id);

-- credit_cards
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "limit" DECIMAL(12,2) NOT NULL,
    closing_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    brand TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS credit_cards_user_id_idx ON credit_cards(user_id);

-- credit_card_invoices
CREATE TABLE IF NOT EXISTS credit_card_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_card_id UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS credit_card_invoices_credit_card_id_idx ON credit_card_invoices(credit_card_id);

-- Alter transactions
ALTER TABLE transactions ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recurrence_id UUID REFERENCES transaction_recurrences(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_id UUID REFERENCES transaction_installments(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'PAID' CHECK (status IN ('PAID', 'UNPAID', 'paid', 'unpaid'));

CREATE INDEX IF NOT EXISTS transactions_credit_card_id_idx ON transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS transactions_recurrence_id_idx ON transactions(recurrence_id);
CREATE INDEX IF NOT EXISTS transactions_installment_id_idx ON transactions(installment_id);

-- invoice_payments
CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_card_invoice_id UUID NOT NULL REFERENCES credit_card_invoices(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_recurrence_id UUID REFERENCES transaction_recurrences(id) ON DELETE CASCADE,
    site TEXT,
    plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- RLS transaction_installments
ALTER TABLE transaction_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transaction_installments" ON transaction_installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transaction_installments" ON transaction_installments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transaction_installments" ON transaction_installments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transaction_installments" ON transaction_installments FOR DELETE USING (auth.uid() = user_id);

-- RLS transaction_recurrences
ALTER TABLE transaction_recurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transaction_recurrences" ON transaction_recurrences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transaction_recurrences" ON transaction_recurrences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transaction_recurrences" ON transaction_recurrences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transaction_recurrences" ON transaction_recurrences FOR DELETE USING (auth.uid() = user_id);

-- RLS credit_cards
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own credit_cards" ON credit_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credit_cards" ON credit_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own credit_cards" ON credit_cards FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own credit_cards" ON credit_cards FOR DELETE USING (auth.uid() = user_id);

-- RLS credit_card_invoices
ALTER TABLE credit_card_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own credit_card_invoices" ON credit_card_invoices FOR SELECT USING (
    credit_card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert their own credit_card_invoices" ON credit_card_invoices FOR INSERT WITH CHECK (
    credit_card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their own credit_card_invoices" ON credit_card_invoices FOR UPDATE USING (
    credit_card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
) WITH CHECK (
    credit_card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete their own credit_card_invoices" ON credit_card_invoices FOR DELETE USING (
    credit_card_id IN (SELECT id FROM credit_cards WHERE user_id = auth.uid())
);

-- RLS invoice_payments
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own invoice_payments" ON invoice_payments FOR SELECT USING (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert their own invoice_payments" ON invoice_payments FOR INSERT WITH CHECK (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their own invoice_payments" ON invoice_payments FOR UPDATE USING (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
) WITH CHECK (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete their own invoice_payments" ON invoice_payments FOR DELETE USING (
    transaction_id IN (SELECT id FROM transactions WHERE user_id = auth.uid())
);

-- RLS subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON subscriptions FOR DELETE USING (auth.uid() = user_id);
