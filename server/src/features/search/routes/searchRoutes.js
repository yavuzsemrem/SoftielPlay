const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);
const spotifyService = require('../../../services/spotifyService');
const { supabase } = require('../../../services/supabase');

/**
 * yt-dlp komutunun yolunu bulur
 * @returns {string} yt-dlp komutu
 */
function getYtDlpCommand() {
  const os = require('os');
  
  // Virtual environment içinde kontrol et (Linux/Mac/Railway için)
  const venvPaths = [
    '/app/venv/bin/yt-dlp',
    path.join(process.cwd(), 'venv', 'bin', 'yt-dlp'),
    path.join(os.homedir(), '.local', 'bin', 'yt-dlp'),
  ];

  for (const ytDlpPath of venvPaths) {
    if (fs.existsSync(ytDlpPath)) {
      return ytDlpPath;
    }
  }

  // Windows'ta Python Scripts klasörünü kontrol et
  if (process.platform === 'win32') {
    const localAppData = path.join(os.homedir(), 'AppData', 'Local');
    const pythonBasePaths = [
      path.join(localAppData, 'Python'),
      path.join(localAppData, 'Programs', 'Python'),
    ];

    for (const pythonBasePath of pythonBasePaths) {
      try {
        if (fs.existsSync(pythonBasePath)) {
          const entries = fs.readdirSync(pythonBasePath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory()) {
              if (entry.name.startsWith('pythoncore-') || entry.name.startsWith('Python')) {
                const scriptsPath = path.join(pythonBasePath, entry.name, 'Scripts', 'yt-dlp.exe');
                
                if (fs.existsSync(scriptsPath)) {
                  return scriptsPath;
                }
              }
            }
          }
        }
      } catch (e) {
        // Devam et
      }
    }
  }

  // Windows'ta Python modülü olarak çalıştırmayı dene
  if (process.platform === 'win32') {
    return 'python -m yt_dlp';
  }

  // PATH'te yt-dlp varsa onu kullan
  return 'yt-dlp';
}

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
    try {
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
    } catch (supabaseError) {
      // Supabase hatası olsa bile devam et (fallback)
      console.warn('⚠️ Supabase mapping kontrolü hatası, YouTube aramasına geçiliyor:', supabaseError.message);
    }

    // 2. SUPABASE'DE YOKSA YT-DLP İLE ARAMA YAP (DOĞRU SONUÇLAR - ~8-12s)
    // NOT: yt-dlp daha yavaş ama çok daha doğru sonuçlar veriyor
    // Supabase mapping sayesinde ikinci seferde anında açılacak
    console.log(`🔍 Supabase'de mapping yok, yt-dlp ile YouTube araması yapılıyor: ${spotifyId}`);
    const track = await spotifyService.getTrack(spotifyId);
    const searchQuery = `${track.track_name} ${track.artist_name}`;
    const ytDlpCmd = getYtDlpCommand();
    
    // yt-dlp ile arama yap (optimize edilmiş bayraklar ile)
    // ytsearch3: İlk 3 sonucu kontrol et (daha hızlı, genelde ilk sonuç doğru)
    const searchCommand = `"${ytDlpCmd}" "ytsearch3:${searchQuery}" --dump-json --no-check-certificate --no-warnings --prefer-free-formats --youtube-skip-dash-manifest --no-playlist`;
    
    let searchOutput;
    try {
      const { stdout } = await execAsync(searchCommand, { 
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 20000 // 20 saniye timeout (doğru sonuç için yeterli)
      });
      searchOutput = stdout;
    } catch (error) {
      console.error('❌ yt-dlp arama komutu hatası:', error);
      return res.status(500).json({ 
        error: 'YouTube arama sırasında hata oluştu',
        message: error.message 
      });
    }

    // JSON çıktısını parse et
    const lines = searchOutput.split('\n').filter(line => line.trim());
    let bestMatch = null;
    let bestScore = 0;

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
          
          // Eşleşme skoru hesapla (daha sıkı kontroller)
          let score = 0;
          
          // Track adı eşleşmesi (daha sıkı kontrol)
          if (normalizedVideoTitle.includes(normalizedTrackName)) {
            score += 10;
          } else {
            // Track adının kelimelerini kontrol et
            const trackWords = normalizedTrackName.split(' ');
            const matchingWords = trackWords.filter(word => 
              word.length > 2 && normalizedVideoTitle.includes(word)
            );
            if (matchingWords.length >= trackWords.length * 0.7) {
              score += 5; // %70+ kelime eşleşmesi
            }
          }
          
          // Sanatçı adı eşleşmesi (daha sıkı kontrol)
          if (normalizedVideoTitle.includes(normalizedArtistName)) {
            score += 5;
          } else {
            // Sanatçı adının kelimelerini kontrol et
            const artistWords = normalizedArtistName.split(' ');
            const matchingWords = artistWords.filter(word => 
              word.length > 2 && normalizedVideoTitle.includes(word)
            );
            if (matchingWords.length >= artistWords.length * 0.7) {
              score += 3; // %70+ kelime eşleşmesi
            }
          }
          
          // Tam eşleşme bonusu (çok yüksek skor)
          if (normalizedVideoTitle === `${normalizedTrackName} ${normalizedArtistName}` ||
              normalizedVideoTitle === `${normalizedArtistName} ${normalizedTrackName}` ||
              normalizedVideoTitle.includes(`${normalizedTrackName} ${normalizedArtistName}`) ||
              normalizedVideoTitle.includes(`${normalizedArtistName} ${normalizedTrackName}`)) {
            score += 30; // Tam eşleşme için çok yüksek bonus
          }

          // Süre uyumu (daha sıkı kontrol - 5 saniye tolerans)
          if (video.duration && track.duration_ms) {
            const videoDurationMs = video.duration * 1000;
            const durationDiff = Math.abs(videoDurationMs - track.duration_ms);
            // 5 saniyeden az fark varsa bonus (daha sıkı)
            if (durationDiff < 5000) {
              score += 10; // Süre uyumu için yüksek bonus
            } else if (durationDiff < 10000) {
              score += 5; // 10 saniyeye kadar tolerans
            }
          }

          // En yüksek skorlu videoyu seç (minimum skor gereksinimi)
          if (score > bestScore && score >= 15) { // Minimum 15 skor gereksinimi
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

    // 3. SUPABASE'E KAYDET (KALICI MAPPING) - Hata olsa bile devam et
    try {
      await saveSongMapping(spotifyId, bestMatch.videoId, track.duration_ms);
    } catch (saveError) {
      console.warn('⚠️ Supabase mapping kayıt hatası (devam ediliyor):', saveError.message);
    }

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
      source: 'yt-dlp'
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





