const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);
const spotifyService = require('../../../services/spotifyService');

/**
 * yt-dlp komutunun yolunu bulur
 * @returns {string} yt-dlp komutu
 */
function getYtDlpCommand() {
  // Virtual environment içinde kontrol et
  const venvPaths = [
    '/app/venv/bin/yt-dlp',
    path.join(process.cwd(), 'venv', 'bin', 'yt-dlp'),
    path.join(require('os').homedir(), '.local', 'bin', 'yt-dlp'),
  ];

  for (const ytDlpPath of venvPaths) {
    if (fs.existsSync(ytDlpPath)) {
      return ytDlpPath;
    }
  }

  // PATH'te yt-dlp varsa onu kullan
  return 'yt-dlp';
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
 */
router.get('/match-youtube/:spotifyId', async (req, res) => {
  try {
    const { spotifyId } = req.params;

    if (!spotifyId) {
      return res.status(400).json({ 
        error: 'Spotify ID gerekli',
        message: 'spotifyId parametresi boş olamaz' 
      });
    }

    // Spotify'dan track bilgilerini al
    const track = await spotifyService.getTrack(spotifyId);

    // YouTube'da arama yap: "track_name artist_name"
    const searchQuery = `${track.track_name} ${track.artist_name}`;
    const ytDlpCmd = getYtDlpCommand();
    
    // yt-dlp ile arama yap (en iyi eşleşmeyi bulmak için ilk 5 sonucu kontrol et)
    const searchCommand = `"${ytDlpCmd}" "ytsearch5:${searchQuery}" --dump-json --no-warnings --no-playlist`;
    
    let searchOutput;
    try {
      const { stdout } = await execAsync(searchCommand, { 
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000 // 30 saniye timeout
      });
      searchOutput = stdout;
    } catch (error) {
      console.error('YouTube arama komutu hatası:', error);
      return res.status(500).json({ 
        error: 'YouTube arama sırasında hata oluştu',
        message: error.message 
      });
    }

    // JSON çıktısını parse et
    const lines = searchOutput.split('\n').filter(line => line.trim());
    let bestMatch = null;
    let bestScore = 0;

    // Track adını ve sanatçı adını normalize et (karşılaştırma için)
    const normalizeString = (str) => {
      return str
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Özel karakterleri kaldır
        .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
        .trim();
    };

    const normalizedTrackName = normalizeString(track.track_name);
    const normalizedArtistName = normalizeString(track.artist_name);

    for (const line of lines) {
      try {
        const video = JSON.parse(line);
        
        if (video.id && video.title) {
          // Video başlığını normalize et
          const normalizedVideoTitle = normalizeString(video.title);
          
          // Eşleşme skoru hesapla
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

          // Süre uyumu (Spotify duration ile karşılaştır)
          if (video.duration && track.duration_ms) {
            const videoDurationMs = video.duration * 1000;
            const durationDiff = Math.abs(videoDurationMs - track.duration_ms);
            // 10 saniyeden az fark varsa bonus
            if (durationDiff < 10000) {
              score += 5;
            }
          }

          // En yüksek skorlu videoyu seç
          if (score > bestScore) {
            bestScore = score;
            
            // Süreyi formatla
            const duration = video.duration || 0;
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Thumbnail URL'ini al
            let thumbnail = null;
            if (video.thumbnail) {
              thumbnail = video.thumbnail;
            } else if (video.thumbnails && video.thumbnails.length > 0) {
              thumbnail = video.thumbnails[video.thumbnails.length - 1].url;
            } else if (video.id) {
              thumbnail = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
            }

            bestMatch = {
              videoId: video.id,
              title: video.title,
              duration: durationFormatted,
              duration_seconds: video.duration || 0,
              thumbnail: thumbnail,
              match_score: score,
            };
          }
        }
      } catch (parseError) {
        // JSON parse hatası, devam et
        continue;
      }
    }

    if (!bestMatch) {
      return res.status(404).json({ 
        error: 'YouTube video bulunamadı',
        message: 'Arama sonuçlarında uygun video bulunamadı' 
      });
    }

    res.json({
      success: true,
      spotify_id: spotifyId,
      spotify_track: {
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_art: track.album_art,
      },
      youtube_match: bestMatch,
    });

  } catch (error) {
    console.error('YouTube eşleştirme hatası:', error);
    res.status(500).json({ 
      error: 'YouTube eşleştirme sırasında hata oluştu',
      message: error.message 
    });
  }
});

module.exports = router;



