const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

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

    if (!videoId || videoId.trim().length === 0) {
      return res.status(400).json({
        error: 'Video ID gerekli',
        message: 'videoId parametresi boş olamaz'
      });
    }

    // YouTube URL'ini oluştur
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId.trim()}`;
    const ytDlpCmd = getYtDlpCommand();
    console.log('🔧 yt-dlp komutu:', ytDlpCmd);

    // yt-dlp ile stream URL'ini al
    // -f "bestaudio[ext=m4a]/bestaudio": Önce m4a formatını dene, yoksa en iyi ses formatını kullan
    // -g: Sadece URL'yi döndür, indirme
    // --no-warnings: Uyarı mesajlarını gizle
    // --no-playlist: Playlist'leri ignore et
    // Windows'ta Python modülü olarak çalışıyorsa tırnak işaretlerini kaldır
    const streamCommand = ytDlpCmd.includes('python -m') 
      ? `${ytDlpCmd} "${youtubeUrl}" -f "bestaudio[ext=m4a]/bestaudio" -g --no-warnings --no-playlist`
      : `"${ytDlpCmd}" "${youtubeUrl}" -f "bestaudio[ext=m4a]/bestaudio" -g --no-warnings --no-playlist`;

    let streamUrl;
    try {
      const { stdout, stderr } = await execAsync(streamCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000 // 30 saniye timeout
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

      console.log(`✅ Stream URL alındı: ${videoId} -> ${streamUrl.substring(0, 50)}...`);

      // Başarılı yanıt döndür
      res.json({
        success: true,
        videoId: videoId.trim(),
        streamUrl: streamUrl
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
