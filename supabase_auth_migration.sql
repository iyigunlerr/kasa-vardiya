-- ══════════════════════════════════════════
-- Finance Mutabakat — Auth & RBAC Migration
-- Supabase SQL Editor'de çalıştırın
-- ══════════════════════════════════════════

-- 1. Profiles tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  created_at timestamptz DEFAULT now()
);

-- 2. RLS aktif et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Politikaları
-- Herkes kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin tüm profilleri görebilir
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Kullanıcılar kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insert (trigger ile otomatik oluşturulacak)
CREATE POLICY "Allow insert for auth trigger" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 4. Yeni kullanıcı kaydında otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (eğer yoksa oluştur)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. İlk admin kullanıcısını oluşturmak için:
-- Supabase Dashboard > Authentication > Add User ile bir kullanıcı ekleyin
-- Sonra bu SQL ile admin yapın:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
