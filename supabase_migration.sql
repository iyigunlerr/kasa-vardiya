-- Shifts tablosuna total_profit_withdrawn sütunu ekle
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_profit_withdrawn numeric DEFAULT 0;

-- Transactions tablosundaki type constraint'i güncelle (eğer enum varsa)
-- Eğer type sütunu text ise bu adım gerekmez
-- ALTER TYPE transaction_type ADD VALUE 'kar';
