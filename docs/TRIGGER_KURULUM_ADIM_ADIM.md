# 🔧 Trigger Kurulumu - Adım Adım Rehber

## ⚠️ ÖNEMLİ: UI'dan Yapılamaz!

`auth.users` tablosu için trigger **sadece SQL Editor'dan** oluşturulabilir. UI'dan (`Database > Triggers > New Trigger`) oluşturulamaz.

---

## ✅ ÇÖZÜM: SQL Editor Kullan

### Adım 1: SQL Editor'a Git
1. Supabase Dashboard'da sol menüden **SQL Editor**'ı tıkla
2. Sağ üstte **New Query** butonuna tıkla (veya `Ctrl+N`)

### Adım 2: Kodu Yapıştır
Aşağıdaki kodu SQL Editor'a kopyala-yapıştır:

```sql
-- ============================================
-- auth.users Trigger Kurulumu
-- ============================================

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

### Adım 3: Çalıştır
1. Sağ üstteki **Run** butonuna tıkla (veya `Ctrl+Enter`)
2. "Success. No rows returned" mesajını görmelisin

### Adım 4: Kontrol Et
Aynı SQL Editor'da şu sorguyu çalıştır:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Beklenen Sonuç:**
```
trigger_name: on_auth_user_created
event_manipulation: INSERT
event_object_table: users
action_statement: EXECUTE FUNCTION public.handle_new_user()
```

### Adım 5: Test Et
1. **Authentication** > **Users** menüsüne git
2. **Add User** > **Create New User** ile yeni bir kullanıcı oluştur
3. **Table Editor** > **profiles** tablosuna git
4. Yeni kullanıcının otomatik olarak eklendiğini kontrol et

---

## 🔍 Alternatif Kontrol Yöntemleri

### Database > Triggers Menüsünden Kontrol
1. **Database** > **Triggers** menüsüne git
2. `on_auth_user_created` trigger'ının listede olduğunu gör
3. **Not:** Burada trigger'ı görebilirsin ama oluşturamazsın

### Function'ı Kontrol Et
SQL Editor'da:

```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

---

## ❌ Neden UI'dan Yapılamıyor?

- `auth` şeması Supabase'in özel bir şemasıdır
- Güvenlik nedeniyle UI'dan doğrudan trigger oluşturulmasına izin verilmez
- `auth.users` tablosu trigger oluşturma UI'ında görünmez
- Bu normal bir kısıtlamadır, hata değil

---

## 🆘 Sorun Giderme

### Hata: "permission denied"
- Projenin admin yetkilerine sahip olduğundan emin ol
- Proje ayarlarından kontrol et

### Trigger çalışmıyor
1. **Database** > **Logs** menüsünden hata mesajlarını kontrol et
2. Function'ın doğru oluşturulduğunu kontrol et (yukarıdaki sorgu ile)
3. Trigger'ın doğru bağlandığını kontrol et:

```sql
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

### Yeni kullanıcı oluşturuldu ama profil oluşmadı
1. `profiles` tablosunda RLS kurallarını kontrol et
2. Function'ın `SECURITY DEFINER` olduğundan emin ol
3. Database Logs'tan hata mesajlarını kontrol et

---

## 📝 Özet

✅ **Yapılabilir:**
- SQL Editor'dan trigger oluşturma
- Function'ı UI'dan oluşturma (ama trigger'ı SQL'den bağlama)

❌ **Yapılamaz:**
- UI'dan `auth.users` için trigger oluşturma
- `Database > Triggers > New Trigger` ile `auth.users` seçme

**Tek Çözüm:** SQL Editor kullan! 🚀






