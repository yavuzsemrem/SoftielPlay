# Supabase Trigger Kurulum Rehberi

## Sorun
Supabase Dashboard'da `auth` şeması görünüyor ancak **New Trigger** oluştururken tablo listesinde `auth.users` görünmüyor. Bu Supabase'in bilinen bir kısıtlamasıdır - `auth` şemasındaki tablolar (`auth.users`, `auth.sessions`, vb.) için trigger'lar UI üzerinden oluşturulamaz.

**Neden?** `auth` şeması Supabase'in özel bir şemasıdır ve güvenlik nedeniyle UI'dan doğrudan trigger oluşturulmasına izin verilmez.

## Çözüm: SQL Editor Kullanımı (Tek Yol)

`auth` schema'sındaki tablolar için trigger'lar **sadece SQL Editor** üzerinden oluşturulabilir. UI'dan (`Database > Triggers > New Trigger`) oluşturulamaz.

### ⚠️ Önemli
- `auth` şeması görünüyor ama `auth.users` tablosu trigger oluşturma UI'ında görünmüyor
- Bu normal bir durum - Supabase'in güvenlik kısıtlaması
- **Tek çözüm: SQL Editor kullanmak**

### Adım 1: SQL Editor'a Git
1. Supabase Dashboard'da sol menüden **SQL Editor**'ı seç
2. **New Query** butonuna tıkla

### Adım 2: Trigger Kodunu Çalıştır
Aşağıdaki kodu SQL Editor'a yapıştır ve **Run** butonuna tıkla:

```sql
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

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Adım 3: Trigger'ın Oluştuğunu Kontrol Et
1. **Database** > **Triggers** menüsüne git
2. `on_auth_user_created` trigger'ının listede olduğunu kontrol et
3. Veya SQL Editor'da şu sorguyu çalıştır:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Adım 4: Test Et
1. **Authentication** > **Users** > **Add User** ile yeni bir kullanıcı oluştur
2. **Table Editor** > **profiles** tablosuna bak
3. Yeni kullanıcının otomatik olarak eklendiğini kontrol et

## Alternatif: Supabase CLI Kullanımı

Eğer Supabase CLI kuruluysa, migration dosyasını şu şekilde çalıştırabilirsiniz:

```bash
supabase db push
```

## Sorun Giderme

### Trigger çalışmıyor mu?
1. **Database** > **Logs** menüsünden hata mesajlarını kontrol et
2. Fonksiyonun doğru oluşturulduğunu kontrol et:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

3. Trigger'ın doğru bağlandığını kontrol et:

```sql
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

### Hata: "permission denied for schema auth"
Bu durumda Supabase projenizin admin yetkilerine sahip olduğunuzdan emin olun. Proje ayarlarından kontrol edin.

## Önemli Notlar

- `auth.users` tablosu Supabase'in özel bir tablosudur ve UI'dan trigger oluşturulamaz
- Trigger'lar sadece SQL Editor veya CLI üzerinden oluşturulabilir
- `SECURITY DEFINER` kullanılması, fonksiyonun `auth.users` tablosuna erişebilmesi için gereklidir
- `ON CONFLICT DO NOTHING` kullanılması, çift kayıt oluşmasını önler

