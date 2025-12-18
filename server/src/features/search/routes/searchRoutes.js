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
 * YouTube arama endpoint'i
 * GET /api/search?q=query
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

    // YouTube arama yap - ytsearch kullanarak
    const searchQuery = `ytsearch15:${q.trim()}`;
    const ytDlpCmd = getYtDlpCommand();
    
    // yt-dlp-exec ile arama yap
    const searchCommand = `"${ytDlpCmd}" "${searchQuery}" --dump-json --no-warnings --no-playlist --flat-playlist`;
    
    let searchOutput;
    try {
      const { stdout } = await execAsync(searchCommand, { 
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 30000 // 30 saniye timeout
      });
      searchOutput = stdout;
    } catch (execError) {
      // Eğer flat-playlist çalışmazsa, normal arama dene
      const normalCommand = `"${ytDlpCmd}" "ytsearch15:${q.trim()}" --dump-json --no-warnings --no-playlist`;
      try {
        const { stdout } = await execAsync(normalCommand, { 
          maxBuffer: 10 * 1024 * 1024,
          timeout: 30000
        });
        searchOutput = stdout;
      } catch (error) {
        console.error('Arama komutu hatası:', error);
        return res.status(500).json({ 
          error: 'Arama sırasında hata oluştu',
          message: error.message 
        });
      }
    }

    // JSON çıktısını parse et
    const lines = searchOutput.split('\n').filter(line => line.trim());
    const results = [];

    for (const line of lines) {
      try {
        const video = JSON.parse(line);
        
        // Video bilgilerini çıkar
        if (video.id && video.title) {
          // Süreyi saniyeden dakika:saniye formatına çevir
          const duration = video.duration || 0;
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          // Thumbnail URL'ini al (en yüksek kaliteli)
          let thumbnail = null;
          if (video.thumbnail) {
            thumbnail = video.thumbnail;
          } else if (video.thumbnails && video.thumbnails.length > 0) {
            // En yüksek çözünürlüklü thumbnail'i al
            thumbnail = video.thumbnails[video.thumbnails.length - 1].url;
          } else if (video.id) {
            // Fallback: YouTube thumbnail URL'i oluştur
            thumbnail = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
          }

          results.push({
            videoId: video.id,
            title: video.title || 'Başlık yok',
            artist: video.uploader || video.channel || video.channel_name || 'Bilinmeyen sanatçı',
            thumbnail: thumbnail,
            duration: durationFormatted,
          });

          // Sonuç sayısını 15 ile sınırla
          if (results.length >= 15) {
            break;
          }
        }
      } catch (parseError) {
        // JSON parse hatası, devam et
        continue;
      }
    }

    // Sonuç sayısını 10-15 arasında sınırla
    const limitedResults = results.slice(0, 15);

    res.json({
      success: true,
      query: q.trim(),
      count: limitedResults.length,
      results: limitedResults,
    });

  } catch (error) {
    console.error('Arama hatası:', error);
    res.status(500).json({ 
      error: 'Arama sırasında hata oluştu',
      message: error.message 
    });
  }
});

module.exports = router;

