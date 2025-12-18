const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const execAsync = promisify(exec);
const NodeCache = require('node-cache');

// node-cache ile stream URL caching (RAM'de, çok hızlı)
const streamUrlCache = new NodeCache({
  stdTTL: 2 * 60 * 60, // 2 saat (saniye cinsinden)
  checkperiod: 60, // Her 60 saniyede bir expire kontrolü
  useClones: false // Performans için clone'lamayı kapat
});

/**
 * Stream URL'in hala geçerli olup olmadığını kontrol eder (HEAD isteği)
 * @param {string} streamUrl - Kontrol edilecek stream URL
 * @returns {Promise<boolean>} - URL geçerliyse true, değilse false
 */
async function validateStreamUrl(streamUrl) {
  try {
    const url = new URL(streamUrl);
    const client = url.protocol === 'https:' ? https : http;
    
    return new Promise((resolve) => {
      const req = client.request(url, { method: 'HEAD', timeout: 2000 }, (res) => {
        // 2xx veya 3xx status kodları geçerli kabul edilir
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    return false;
  }
}

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

    // Bilinen Windows yollarını kontrol et
    const knownPaths = [
      path.join(localAppData, 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.13-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.12-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.11-64', 'Scripts', 'yt-dlp.exe'),
    ];

    for (const ytDlpPath of knownPaths) {
      if (fs.existsSync(ytDlpPath)) {
        return ytDlpPath;
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
 * Stream URL endpoint'i
 * GET /api/stream/:videoId
 * YouTube video ID'sini oynatılabilir ses URL'sine dönüştürür
 * iOS ve Android native oynatıcılarıyla uyumlu m4a formatını tercih eder
 */
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const trimmedVideoId = videoId.trim();

    if (!trimmedVideoId || trimmedVideoId.length === 0) {
      return res.status(400).json({
        error: 'Video ID gerekli',
        message: 'videoId parametresi boş olamaz'
      });
    }

    // Cache kontrolü: node-cache otomatik TTL yönetimi yapar
    const cached = streamUrlCache.get(trimmedVideoId);
    if (cached) {
      console.log(`⚡⚡ node-cache hit: ${trimmedVideoId} (anında)`);
      return res.json({
        success: true,
        videoId: trimmedVideoId,
        streamUrl: cached,
        cached: true
      });
    }

    // YouTube URL'ini oluştur
    const youtubeUrl = `https://www.youtube.com/watch?v=${trimmedVideoId}`;
    const ytDlpCmd = getYtDlpCommand();
    console.log('🔧 yt-dlp komutu:', ytDlpCmd);

    // yt-dlp ile stream URL'ini al (optimizasyon bayrakları ile)
    // -f "bestaudio[ext=m4a]/bestaudio": Önce m4a formatını dene, yoksa en iyi ses formatını kullan
    // -g: Sadece URL'yi döndür, indirme (en hızlı mod)
    // --no-check-certificate: SSL sertifika kontrolünü atla (hız için)
    // --no-warnings: Uyarı mesajlarını gizle
    // --prefer-free-formats: Ücretsiz formatları tercih et (hız için)
    // --youtube-skip-dash-manifest: DASH manifest'i atla (hız için)
    // --no-playlist: Playlist'leri ignore et
    const streamCommand = ytDlpCmd.includes('python -m') 
      ? `${ytDlpCmd} "${youtubeUrl}" -f "bestaudio[ext=m4a]/bestaudio" -g --no-check-certificate --no-warnings --prefer-free-formats --youtube-skip-dash-manifest --no-playlist`
      : `"${ytDlpCmd}" "${youtubeUrl}" -f "bestaudio[ext=m4a]/bestaudio" -g --no-check-certificate --no-warnings --prefer-free-formats --youtube-skip-dash-manifest --no-playlist`;

    let streamUrl;
    try {
      const { stdout, stderr } = await execAsync(streamCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 15000 // 15 saniye timeout (optimizasyon için düşürüldü)
      });

      // stdout'tan stream URL'ini al (trim ile boşlukları temizle)
      streamUrl = stdout.trim();

      // Stream URL boşsa hata döndür
      if (!streamUrl || streamUrl.length === 0) {
        console.error('⚠️ Stream URL alınamadı:', stderr);
        return res.status(404).json({
          error: 'Stream URL bulunamadı',
          message: 'Video için oynatılabilir ses URL\'si alınamadı. Video kısıtlı olabilir veya mevcut değil.'
        });
      }

      // URL formatını kontrol et
      if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
        console.error('⚠️ Geçersiz stream URL formatı:', streamUrl);
        return res.status(500).json({
          error: 'Geçersiz stream URL formatı',
          message: 'Alınan URL geçerli bir HTTP/HTTPS URL\'si değil'
        });
      }

      // node-cache'e kaydet (otomatik TTL yönetimi)
      streamUrlCache.set(trimmedVideoId, streamUrl);
      console.log(`✅ Stream URL alındı ve node-cache'e kaydedildi: ${trimmedVideoId} -> ${streamUrl.substring(0, 50)}...`);

      // Başarılı yanıt döndür
      res.json({
        success: true,
        videoId: trimmedVideoId,
        streamUrl: streamUrl,
        cached: false
      });

    } catch (error) {
      // Hata mesajını analiz et
      const errorMessage = error.message || error.stderr || 'Bilinmeyen hata';

      // Video bulunamadı veya kısıtlı
      if (errorMessage.includes('Private video') || 
          errorMessage.includes('Video unavailable') ||
          errorMessage.includes('This video is not available') ||
          errorMessage.includes('Sign in to confirm your age') ||
          errorMessage.includes('Video unavailable')) {
        console.error('❌ Video kısıtlı veya mevcut değil:', videoId);
        return res.status(404).json({
          error: 'Video bulunamadı',
          message: 'Video kısıtlı, özel veya mevcut değil. Lütfen başka bir video deneyin.'
        });
      }

      // Genel hata
      console.error('❌ Stream URL alma hatası:', errorMessage);
      return res.status(500).json({
        error: 'Stream URL alınamadı',
        message: errorMessage
      });
    }

  } catch (error) {
    console.error('❌ Stream endpoint hatası:', error);
    res.status(500).json({
      error: 'Stream URL alınamadı',
      message: error.message
    });
  }
});

module.exports = router;



