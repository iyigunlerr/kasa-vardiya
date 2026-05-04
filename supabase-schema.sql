-- =============================================
-- Kasa Vardiya Devir Teslim — Veritabanı Şeması
-- =============================================

-- shifts tablosu
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_name TEXT NOT NULL DEFAULT 'Bilinmiyor',
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  starting_cash NUMERIC(12,2) NOT NULL DEFAULT 0,
  ending_cash NUMERIC(12,2),
  bank_balance NUMERIC(12,2),
  total_commission NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  cash_deficit NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- transactions tablosu
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('komisyon', 'masraf')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_transactions_shift_id ON transactions(shift_id);

-- RLS politikaları
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on shifts" ON shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
