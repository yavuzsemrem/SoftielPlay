-- ============================================
-- HIZLI KURULUM: auth.users Trigger'ı
-- ============================================
-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın
-- UI'dan (Database > Triggers > New Trigger) oluşturulamaz!

-- Önce mevcut trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Fonksiyonu oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, status)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur (auth.users tablosunda)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Kontrol sorgusu (trigger'ın oluştuğunu doğrula)
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Başarılı mesajı görmelisiniz:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
-- event_object_table: users
-- action_statement: EXECUTE FUNCTION public.handle_new_user()






