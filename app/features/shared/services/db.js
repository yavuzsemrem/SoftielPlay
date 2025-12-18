import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Veritabanı bağlantısını açar ve tabloları oluşturur
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function initDatabase() {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('openaudio.db');

  // Local songs tablosu (offline şarkılar)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_songs (
      id TEXT PRIMARY KEY,
      youtube_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      artist TEXT,
      duration INTEGER,
      thumbnail_url TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_played_at TIMESTAMP
    );
  `);

  // Cached metadata tablosu (YouTube metadata cache)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_metadata (
      youtube_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT,
      duration INTEGER,
      thumbnail_url TEXT,
      description TEXT,
      view_count INTEGER,
      like_count INTEGER,
      cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
    );
  `);

  // Indexler
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_local_songs_youtube_id ON local_songs(youtube_id);
    CREATE INDEX IF NOT EXISTS idx_local_songs_last_played ON local_songs(last_played_at);
    CREATE INDEX IF NOT EXISTS idx_cached_metadata_expires ON cached_metadata(expires_at);
  `);

  return db;
}

/**
 * Veritabanı bağlantısını döndürür (lazy initialization)
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export async function getDatabase() {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * Local songs tablosuna şarkı ekler veya günceller
 * @param {Object} song - Şarkı bilgileri
 * @returns {Promise<void>}
 */
export async function saveLocalSong(song) {
  const database = await getDatabase();
  
  await database.runAsync(
    `INSERT OR REPLACE INTO local_songs 
     (id, youtube_id, title, artist, duration, thumbnail_url, file_path, file_size, downloaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      song.id || song.youtube_id,
      song.youtube_id,
      song.title,
      song.artist || null,
      song.duration || null,
      song.thumbnail_url || null,
      song.file_path,
      song.file_size || null,
      new Date().toISOString()
    ]
  );
}

/**
 * Local songs tablosundan şarkı getirir
 * @param {string} youtubeId - YouTube ID
 * @returns {Promise<Object|null>}
 */
export async function getLocalSong(youtubeId) {
  const database = await getDatabase();
  
  const result = await database.getFirstAsync(
    `SELECT * FROM local_songs WHERE youtube_id = ?`,
    [youtubeId]
  );
  
  return result || null;
}

/**
 * Tüm local songs'ları getirir
 * @returns {Promise<Array>}
 */
export async function getAllLocalSongs() {
  const database = await getDatabase();
  
  return await database.getAllAsync(
    `SELECT * FROM local_songs ORDER BY last_played_at DESC, downloaded_at DESC`
  );
}

/**
 * Local song'un son çalınma zamanını günceller
 * @param {string} youtubeId - YouTube ID
 * @returns {Promise<void>}
 */
export async function updateLastPlayed(youtubeId) {
  const database = await getDatabase();
  
  await database.runAsync(
    `UPDATE local_songs SET last_played_at = ? WHERE youtube_id = ?`,
    [new Date().toISOString(), youtubeId]
  );
}

/**
 * Local song'u siler
 * @param {string} youtubeId - YouTube ID
 * @returns {Promise<void>}
 */
export async function deleteLocalSong(youtubeId) {
  const database = await getDatabase();
  
  await database.runAsync(
    `DELETE FROM local_songs WHERE youtube_id = ?`,
    [youtubeId]
  );
}

/**
 * Metadata cache'e kaydeder
 * @param {Object} metadata - Metadata bilgileri
 * @param {number} ttlHours - Time to live (saat cinsinden, varsayılan 24)
 * @returns {Promise<void>}
 */
export async function cacheMetadata(metadata, ttlHours = 24) {
  const database = await getDatabase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
  
  await database.runAsync(
    `INSERT OR REPLACE INTO cached_metadata 
     (youtube_id, title, artist, duration, thumbnail_url, description, view_count, like_count, cached_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      metadata.youtube_id,
      metadata.title,
      metadata.artist || null,
      metadata.duration || null,
      metadata.thumbnail_url || null,
      metadata.description || null,
      metadata.view_count || null,
      metadata.like_count || null,
      now.toISOString(),
      expiresAt.toISOString()
    ]
  );
}

/**
 * Cache'den metadata getirir (expire olmamışsa)
 * @param {string} youtubeId - YouTube ID
 * @returns {Promise<Object|null>}
 */
export async function getCachedMetadata(youtubeId) {
  const database = await getDatabase();
  
  const result = await database.getFirstAsync(
    `SELECT * FROM cached_metadata 
     WHERE youtube_id = ? AND expires_at > ?`,
    [youtubeId, new Date().toISOString()]
  );
  
  return result || null;
}

/**
 * Expire olmuş cache kayıtlarını temizler
 * @returns {Promise<void>}
 */
export async function cleanExpiredCache() {
  const database = await getDatabase();
  
  await database.runAsync(
    `DELETE FROM cached_metadata WHERE expires_at <= ?`,
    [new Date().toISOString()]
  );
}
