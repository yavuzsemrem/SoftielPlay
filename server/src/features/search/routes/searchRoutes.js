const express = require('express');
const router = express.Router();
const spotifyService = require('../../../services/spotifyService');
const { supabase } = require('../../../services/supabase');
const YouTube = require('youtube-sr').default;

/**
 * Supabase'den song mapping'i alır
 * @param {string} spotifyId - Spotify track ID
 * @returns {Promise<Object|null>} Mapping bilgisi veya null
 */
async function getSongMapping(spotifyId) {
  try {
    const { data, error } = await supabase
      .from('song_mappings')
      .select('*')
      .eq('spotify_id', spotifyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Supabase song_mappings sorgu hatası:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Supabase song_mappings hatası:', error);
    return null;
  }
}

/**
 * Supabase'e song mapping kaydeder
 * @param {string} spotifyId - Spotify track ID
 * @param {string} youtubeId - YouTube video ID
 * @param {number} durationMs - Süre (milisaniye)
 */
async function saveSongMapping(spotifyId, youtubeId, durationMs) {
  try {
    const { error } = await supabase
      .from('song_mappings')
      .upsert({
        spotify_id: spotifyId,
        youtube_id: youtubeId,
        duration_ms: durationMs,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'spotify_id'
      });

    if (error) {
      console.error('❌ Supabase song_mappings kayıt hatası:', error);
    } else {
      console.log(`✅ Song mapping kaydedildi: ${spotifyId} -> ${youtubeId}`);
    }
  } catch (error) {
    console.error('❌ Supabase song_mappings kayıt hatası:', error);
  }
}

/**
 * Spotify arama endpoint'i
 * GET /api/search?q=query
 * Spotify'dan metadata alır (album_art, track_name, artist_name, spotify_id)
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Arama sorgusu gerekli',
        message: 'q parametresi boş olamaz' 
      });
    }

    // Spotify credentials kontrolü
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.error('❌ Spotify credentials eksik! SPOTIFY_CLIENT_ID ve SPOTIFY_CLIENT_SECRET environment variable\'ları ayarlanmalı.');
      return res.status(500).json({
        success: false,
        error: 'Spotify credentials eksik',
        message: 'SPOTIFY_CLIENT_ID ve SPOTIFY_CLIENT_SECRET environment variable\'ları ayarlanmalı',
        results: [],
        count: 0
      });
    }

    // Sadece Spotify'da arama yap - YouTube kullanma
    console.log('🔍 Spotify arama yapılıyor:', q.trim());
    let tracks;
    try {
      tracks = await spotifyService.searchTracks(q.trim(), 15);
    } catch (error) {
      console.error('❌ Spotify arama hatası:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Spotify arama hatası',
        message: error.message,
        results: [],
        count: 0
      });
    }

    if (!tracks || tracks.length === 0) {
      console.log('⚠️ Spotify arama sonucu bulunamadı');
      return res.json({
        success: true,
        query: q.trim(),
        count: 0,
        results: [],
      });
    }

    // Sonuçları formatla - Sadece Spotify formatı
    const results = tracks.map((track) => {
      // Spotify formatını doğrula
      if (!track.spotify_id || !track.track_name || !track.artist_name) {
        console.warn('⚠️ Geçersiz Spotify track formatı:', track);
        return null;
      }

      // Duration'ı ms'den dakika:saniye formatına çevir
      const durationMs = track.duration_ms || 0;
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      return {
        spotify_id: track.spotify_id,
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_art: track.album_art || null,
        album_name: track.album_name || null,
        duration: durationFormatted,
        duration_ms: track.duration_ms || null,
        preview_url: track.preview_url || null,
      };
    }).filter(track => track !== null); // Geçersiz track'leri filtrele

    console.log(`✅ Spotify arama tamamlandı: ${results.length} sonuç bulundu`);

    res.json({
      success: true,
      query: q.trim(),
      count: results.length,
      results: results,
    });

  } catch (error) {
    console.error('❌ Spotify arama hatası:', error);
    // Hata durumunda boş sonuç döndür, YouTube'a fallback yapma
    res.status(500).json({ 
      success: false,
      error: 'Arama sırasında hata oluştu',
      message: error.message,
      results: [],
      count: 0
    });
  }
});

/**
 * YouTube video eşleştirme endpoint'i
 * GET /api/match-youtube/:spotifyId
 * Spotify track bilgilerini alıp YouTube'da en doğru videoyu bulur
 * Önce Supabase'deki kalıcı mapping'e bakar, yoksa youtube-sr ile arama yapar
 */
router.get('/match-youtube/:spotifyId', async (req, res) => {
  const startTime = Date.now();
  try {
    const { spotifyId } = req.params;

    if (!spotifyId) {
      return res.status(400).json({ 
        error: 'Spotify ID gerekli',
        message: 'spotifyId parametresi boş olamaz' 
      });
    }

    // 1. ÖNCE SUPABASE'DEN KALICI MAPPING'E BAK (ÇOK HIZLI - <10ms)
    const mapping = await getSongMapping(spotifyId);
    if (mapping && mapping.youtube_id) {
      const dbTime = Date.now() - startTime;
      console.log(`⚡⚡ Supabase mapping hit: ${spotifyId} -> ${mapping.youtube_id} (${dbTime}ms)`);
      
      // Spotify track bilgilerini al (cache için)
      const track = await spotifyService.getTrack(spotifyId);
      
      const trackInfo = {
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_art: track.album_art,
      };

      const bestMatch = {
        videoId: mapping.youtube_id,
        title: `${track.track_name} - ${track.artist_name}`,
        duration: mapping.duration_ms ? `${Math.floor(mapping.duration_ms / 60000)}:${String(Math.floor((mapping.duration_ms % 60000) / 1000)).padStart(2, '0')}` : '0:00',
        duration_seconds: mapping.duration_ms ? Math.floor(mapping.duration_ms / 1000) : 0,
        thumbnail: `https://img.youtube.com/vi/${mapping.youtube_id}/maxresdefault.jpg`,
        match_score: 100, // Kalıcı mapping = mükemmel eşleşme
      };

      return res.json({
        success: true,
        spotify_id: spotifyId,
        spotify_track: trackInfo,
        youtube_match: bestMatch,
        cached: true,
        source: 'supabase'
      });
    }

    // 2. SUPABASE'DE YOKSA YOUTUBE-SR İLE ARAMA YAP (HIZLI - ~2-5s)
    console.log(`🔍 Supabase'de mapping yok, YouTube araması yapılıyor: ${spotifyId}`);
    const track = await spotifyService.getTrack(spotifyId);
    const searchQuery = `${track.track_name} ${track.artist_name}`;
    
    let searchResults;
    try {
      // youtube-sr ile arama (çok daha hızlı - yt-dlp'den 10x daha hızlı)
      searchResults = await YouTube.search(searchQuery, { 
        limit: 5, // İlk 5 sonucu kontrol et
        type: 'video'
      });
    } catch (error) {
      console.error('❌ YouTube-SR arama hatası:', error);
      return res.status(500).json({ 
        error: 'YouTube arama sırasında hata oluştu',
        message: error.message 
      });
    }

    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({ 
        error: 'YouTube video bulunamadı',
        message: 'Arama sonuçlarında uygun video bulunamadı' 
      });
    }

    // En iyi eşleşmeyi bul
    let bestMatch = null;
    let bestScore = 0;

    const normalizeString = (str) => {
      return str
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedTrackName = normalizeString(track.track_name);
    const normalizedArtistName = normalizeString(track.artist_name);

    for (const video of searchResults) {
      if (!video.id || !video.title) continue;

      const normalizedVideoTitle = normalizeString(video.title);
      let score = 0;

      // Track adı eşleşmesi
      if (normalizedVideoTitle.includes(normalizedTrackName)) {
        score += 10;
      }

      // Sanatçı adı eşleşmesi
      if (normalizedVideoTitle.includes(normalizedArtistName)) {
        score += 5;
      }

      // Tam eşleşme bonusu
      if (normalizedVideoTitle === `${normalizedTrackName} ${normalizedArtistName}` ||
          normalizedVideoTitle === `${normalizedArtistName} ${normalizedTrackName}`) {
        score += 20;
      }

      // Süre uyumu
      if (video.duration && track.duration_ms) {
        const videoDurationMs = video.duration * 1000;
        const durationDiff = Math.abs(videoDurationMs - track.duration_ms);
        if (durationDiff < 10000) {
          score += 5;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        const duration = video.duration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        bestMatch = {
          videoId: video.id,
          title: video.title,
          duration: durationFormatted,
          duration_seconds: duration || 0,
          thumbnail: video.thumbnail?.displayThumbnailURL('maxresdefault') || `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
          match_score: score,
        };
      }
    }

    if (!bestMatch) {
      return res.status(404).json({ 
        error: 'YouTube video bulunamadı',
        message: 'Arama sonuçlarında uygun video bulunamadı' 
      });
    }

    // 3. SUPABASE'E KAYDET (KALICI MAPPING)
    await saveSongMapping(spotifyId, bestMatch.videoId, track.duration_ms);

    const trackInfo = {
      track_name: track.track_name,
      artist_name: track.artist_name,
      album_art: track.album_art,
    };

    const totalTime = Date.now() - startTime;
    console.log(`✅ YouTube eşleştirme tamamlandı: ${spotifyId} -> ${bestMatch.videoId} (${totalTime}ms)`);

    res.json({
      success: true,
      spotify_id: spotifyId,
      spotify_track: trackInfo,
      youtube_match: bestMatch,
      cached: false,
      source: 'youtube-sr'
    });

  } catch (error) {
    console.error('❌ YouTube eşleştirme hatası:', error);
    res.status(500).json({ 
      error: 'YouTube eşleştirme sırasında hata oluştu',
      message: error.message 
    });
  }
});

module.exports = router;





