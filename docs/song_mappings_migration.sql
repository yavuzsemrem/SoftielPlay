-- Song Mappings Tablosu
-- Spotify ID -> YouTube ID kalıcı eşleme tablosu
-- Performans optimizasyonu için kritik tablo

CREATE TABLE IF NOT EXISTS song_mappings (
  spotify_id TEXT PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index: YouTube ID ile hızlı arama için
CREATE INDEX IF NOT EXISTS idx_song_mappings_youtube_id ON song_mappings(youtube_id);

-- Index: Güncelleme zamanına göre sıralama için
CREATE INDEX IF NOT EXISTS idx_song_mappings_updated_at ON song_mappings(updated_at);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_song_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_song_mappings_updated_at
  BEFORE UPDATE ON song_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_song_mappings_updated_at();

-- RLS: Herkes okuyabilir, sadece backend yazabilir (service_role key ile)
ALTER TABLE song_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes song_mappings okuyabilir"
  ON song_mappings FOR SELECT
  USING (true);

-- Service role ile INSERT/UPDATE yapılabilir (backend'den)
-- Bu policy backend'in service_role key'i ile çalışacak
