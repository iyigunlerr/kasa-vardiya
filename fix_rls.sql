-- 1. Sonsuz döngüye giren hatalı RLS politikasını siliyoruz
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Rol kontrolü için RLS'yi atlayabilen (SECURITY DEFINER) güvenli bir fonksiyon oluşturuyoruz
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
  status boolean;
BEGIN
  SELECT (role = 'admin') INTO status FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Yönetici görme iznini yeni fonksiyon ile tekrar ekliyoruz
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
