-- OpenAudio Supabase Veritabanı Migration
-- Bu dosya Supabase Dashboard'da SQL Editor'de çalıştırılmalıdır

-- ============================================
-- 1. PROFILES TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'pro')),
  pro_expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. FOLLOWS TABLOSU (Takip Sistemi)
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ============================================
-- 3. PLAYLISTS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PLAYLIST_SONGS TABLOSU
-- ============================================
CREATE TABLE IF NOT EXISTS public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  thumbnail TEXT,
  duration INTEGER, -- saniye cinsinden
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  position INTEGER DEFAULT 0 -- playlist içindeki sıra
);

-- ============================================
-- 5. INDEXLER (Performans İyileştirmeleri)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_public ON public.playlists(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_songs_position ON public.playlist_songs(playlist_id, position);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) ETKİNLEŞTİRME
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLİTİKALARI - PROFILES
-- ============================================
-- Herkes tüm profilleri görebilir (public profil görünümü)
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

-- Kullanıcılar sadece kendi profillerini güncelleyebilir
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. RLS POLİTİKALARI - FOLLOWS
-- ============================================
-- Herkes takip ilişkilerini görebilir (public takipçi listesi için)
CREATE POLICY "follows_select_all"
  ON public.follows FOR SELECT
  USING (true);

-- Kullanıcılar sadece kendi takip ilişkilerini oluşturabilir
CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Kullanıcılar sadece kendi takip ilişkilerini silebilir (takibi bırakma)
CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- 9. RLS POLİTİKALARI - PLAYLISTS
-- ============================================
-- Herkes public playlistleri görebilir, kullanıcılar kendi playlistlerini görebilir
CREATE POLICY "playlists_select_own_and_public"
  ON public.playlists FOR SELECT
  USING (
    auth.uid() = user_id OR is_public = true
  );

-- Kullanıcılar sadece kendi playlistlerini oluşturabilir
CREATE POLICY "playlists_insert_own"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi playlistlerini güncelleyebilir
CREATE POLICY "playlists_update_own"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi playlistlerini silebilir
CREATE POLICY "playlists_delete_own"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 10. RLS POLİTİKALARI - PLAYLIST_SONGS
-- ============================================
-- Kullanıcılar sadece kendi playlistlerindeki şarkıları görebilir
-- veya public playlistlerdeki şarkıları görebilir
CREATE POLICY "playlist_songs_select_own_playlist"
  ON public.playlist_songs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

-- Kullanıcılar sadece kendi playlistlerine şarkı ekleyebilir
CREATE POLICY "playlist_songs_insert_own_playlist"
  ON public.playlist_songs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Kullanıcılar sadece kendi playlistlerindeki şarkıları güncelleyebilir
CREATE POLICY "playlist_songs_update_own_playlist"
  ON public.playlist_songs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- Kullanıcılar sadece kendi playlistlerindeki şarkıları silebilir
CREATE POLICY "playlist_songs_delete_own_playlist"
  ON public.playlist_songs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists
      WHERE playlists.id = playlist_songs.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- ============================================
-- 11. TRIGGER: updated_at Otomatik Güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. TRIGGER: Yeni Kullanıcı Kaydında Profil Oluşturma
-- ============================================
-- NOT: auth.users tablosu Supabase UI'da görünmediği için
-- bu trigger'ı SQL Editor'dan çalıştırmanız gerekiyor.
-- Dashboard > SQL Editor > New Query > Bu kodu çalıştırın.

-- Önce mevcut trigger'ı sil (varsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Fonksiyonu oluştur (search_path ile)
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
-- Bu komut sadece SQL Editor'dan çalıştırılabilir!
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MİGRASYON TAMAMLANDI
-- ============================================
-- Bu migration dosyası çalıştırıldıktan sonra:
-- 1. Tablolar oluşturulmuş olacak
-- 2. RLS kuralları aktif olacak
-- 3. Trigger'lar çalışır durumda olacak
-- 4. Yeni kullanıcı kayıtlarında otomatik profil oluşturulacak

