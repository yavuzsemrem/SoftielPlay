const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Sistemde bir komutun mevcut olup olmadığını kontrol eder
 * @param {string} command - Kontrol edilecek komut
 * @param {string[]} args - Komut argümanları (opsiyonel)
 * @returns {Promise<boolean>} - Komut mevcutsa true, değilse false
 */
async function checkCommand(command, args = ['--version']) {
  try {
    const commandStr = `${command} ${args.join(' ')}`;
    await execAsync(commandStr, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Python'un sistemde mevcut olup olmadığını kontrol eder
 * @returns {Promise<boolean>}
 */
async function checkPython() {
  // Windows'ta 'python' veya 'python3', Linux/Mac'te 'python3' olabilir
  const pythonCommands = ['python', 'python3'];
  
  for (const cmd of pythonCommands) {
    if (await checkCommand(cmd)) {
      return true;
    }
  }
  
  return false;
}

/**
 * FFmpeg'in sistemde mevcut olup olmadığını kontrol eder
 * @returns {Promise<boolean>}
 */
async function checkFFmpeg() {
  // Önce PATH'te kontrol et
  if (await checkCommand('ffmpeg')) {
    return true;
  }

  // Nix store ve nix-profile içinde kontrol et (Railway/Nixpacks için)
  const nixPaths = [
    '/root/.nix-profile/bin/ffmpeg',
    path.join(os.homedir(), '.nix-profile', 'bin', 'ffmpeg'),
    '/nix/store',
  ];

  // Nix profile bin dizinini kontrol et
  for (const nixPath of nixPaths.slice(0, 2)) {
    if (fs.existsSync(nixPath)) {
      try {
        await execAsync(`"${nixPath}" -version`, { timeout: 3000 });
        return true;
      } catch (e) {
        // Devam et
      }
    }
  }

  // Nix store içinde ffmpeg ara (sadece Linux'ta)
  if (process.platform !== 'win32') {
    try {
      if (fs.existsSync('/nix/store')) {
        const { stdout } = await execAsync('find /nix/store -name "ffmpeg" -type f 2>/dev/null | head -1', { timeout: 5000 });
        const ffmpegPath = stdout.trim();
        if (ffmpegPath && fs.existsSync(ffmpegPath)) {
          try {
            await execAsync(`"${ffmpegPath}" -version`, { timeout: 3000 });
            return true;
          } catch (e) {
            // Devam et
          }
        }
      }
    } catch (e) {
      // Devam et
    }
  }

  // Windows'ta yaygın kurulum yerlerini kontrol et
  if (process.platform === 'win32') {
    const winGetPath = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages');
    
    try {
      if (fs.existsSync(winGetPath)) {
        // WinGet paketlerinde FFmpeg ara
        const packages = fs.readdirSync(winGetPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.includes('FFmpeg'))
          .map(dirent => path.join(winGetPath, dirent.name));

        for (const packagePath of packages) {
          // ffmpeg-* klasörlerini ara
          const subdirs = fs.readdirSync(packagePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('ffmpeg-'))
            .map(dirent => path.join(packagePath, dirent.name, 'bin', 'ffmpeg.exe'));

          for (const ffmpegPath of subdirs) {
            if (fs.existsSync(ffmpegPath)) {
              try {
                await execAsync(`"${ffmpegPath}" -version`, { timeout: 3000 });
                return true;
              } catch (e) {
                // Devam et
              }
            }
          }
        }
      }
    } catch (e) {
      // Devam et
    }

    // Diğer yaygın yerler
    const otherPaths = [
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      path.join(os.homedir(), 'ffmpeg', 'bin', 'ffmpeg.exe'),
    ];

    for (const ffmpegPath of otherPaths) {
      if (fs.existsSync(ffmpegPath)) {
        try {
          await execAsync(`"${ffmpegPath}" -version`, { timeout: 3000 });
          return true;
        } catch (e) {
          // Devam et
        }
      }
    }
  }

  return false;
}

/**
 * yt-dlp'nin sistemde mevcut olup olmadığını kontrol eder
 * @returns {Promise<boolean>}
 */
async function checkYtDlp() {
  // Önce PATH'te kontrol et
  if (await checkCommand('yt-dlp')) {
    return true;
  }

  // Virtual environment içinde kontrol et (Railway/Nixpacks için)
  const venvPaths = [
    '/app/venv/bin/yt-dlp',
    path.join(process.cwd(), 'venv', 'bin', 'yt-dlp'),
    path.join(os.homedir(), '.local', 'bin', 'yt-dlp'),
    '/root/.nix-profile/bin/yt-dlp',
    path.join(os.homedir(), '.nix-profile', 'bin', 'yt-dlp'),
  ];

  for (const ytDlpPath of venvPaths) {
    if (fs.existsSync(ytDlpPath)) {
      try {
        await execAsync(`"${ytDlpPath}" --version`, { timeout: 5000 });
        return true;
      } catch (e) {
        // Devam et
      }
    }
  }

  // Nix store içinde yt-dlp ara (sadece Linux'ta)
  if (process.platform !== 'win32') {
    try {
      if (fs.existsSync('/nix/store')) {
        const { stdout } = await execAsync('find /nix/store -name "yt-dlp" -type f 2>/dev/null | head -1', { timeout: 5000 });
        const ytDlpPath = stdout.trim();
        if (ytDlpPath && fs.existsSync(ytDlpPath)) {
          try {
            await execAsync(`"${ytDlpPath}" --version`, { timeout: 5000 });
            return true;
          } catch (e) {
            // Devam et
          }
        }
      }
    } catch (e) {
      // Devam et
    }
  }

  // Windows'ta Python Scripts klasörünü kontrol et
  if (process.platform === 'win32') {
    const localAppData = path.join(os.homedir(), 'AppData', 'Local');
    
    // Python klasörlerini bul
    const pythonBasePaths = [
      path.join(localAppData, 'Python'),
      path.join(localAppData, 'Programs', 'Python'),
    ];

    for (const pythonBasePath of pythonBasePaths) {
      try {
        if (fs.existsSync(pythonBasePath)) {
          // Tüm Python versiyon klasörlerini tara
          const entries = fs.readdirSync(pythonBasePath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory()) {
              // pythoncore-* veya Python3* klasörlerini kontrol et
              if (entry.name.startsWith('pythoncore-') || entry.name.startsWith('Python')) {
                const scriptsPath = path.join(pythonBasePath, entry.name, 'Scripts', 'yt-dlp.exe');
                
                if (fs.existsSync(scriptsPath)) {
                  try {
                    await execAsync(`"${scriptsPath}" --version`, { timeout: 5000 });
                    return true;
                  } catch (e) {
                    // Devam et, başka bir yerde ara
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        // Devam et
      }
    }

    // Direkt bilinen yolları da kontrol et
    const knownPaths = [
      path.join(localAppData, 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.13-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.12-64', 'Scripts', 'yt-dlp.exe'),
      path.join(localAppData, 'Python', 'pythoncore-3.11-64', 'Scripts', 'yt-dlp.exe'),
    ];

    for (const ytDlpPath of knownPaths) {
      if (fs.existsSync(ytDlpPath)) {
        try {
          await execAsync(`"${ytDlpPath}" --version`, { timeout: 5000 });
          return true;
        } catch (e) {
          // Devam et
        }
      }
    }
  }

  return false;
}

/**
 * Tüm sistem bağımlılıklarını kontrol eder
 * @returns {Promise<{python: boolean, ffmpeg: boolean, ytDlp: boolean}>}
 */
async function checkSystemDependencies() {
  const [python, ffmpeg, ytDlp] = await Promise.all([
    checkPython(),
    checkFFmpeg(),
    checkYtDlp()
  ]);

  return {
    python,
    ffmpeg,
    ytDlp
  };
}

/**
 * Sistem bağımlılıklarını kontrol eder ve eksik olanları konsola yazdırır
 * @param {boolean} skipCheck - Kontrolleri atla (development için)
 * @returns {Promise<boolean>} - Tüm bağımlılıklar mevcutsa true, değilse false
 */
async function validateSystemDependencies(skipCheck = false) {
  // Development modunda kontrolleri atla
  if (skipCheck || process.env.SKIP_SYSTEM_CHECK === 'true') {
    console.log('⚠️  Sistem bağımlılık kontrolleri atlandı (development modu)');
    return true;
  }

  const dependencies = await checkSystemDependencies();
  const missing = [];

  if (!dependencies.python) {
    missing.push('Python');
  }

  if (!dependencies.ffmpeg) {
    missing.push('FFmpeg');
  }

  if (!dependencies.ytDlp) {
    missing.push('yt-dlp');
  }

  if (missing.length > 0) {
    console.error('\n' + '='.repeat(80));
    console.error('⚠️  KRİTİK HATA: EKSİK SİSTEM BAĞIMLILIKLARI');
    console.error('='.repeat(80));
    console.error('\nAşağıdaki bağımlılıklar sisteminizde bulunamadı:\n');
    
    missing.forEach(dep => {
      console.error(`  ❌ ${dep}`);
    });

    console.error('\nLütfen eksik bağımlılıkları kurun:');
    
    if (!dependencies.python) {
      console.error('  • Python: https://www.python.org/downloads/');
    }
    
    if (!dependencies.ffmpeg) {
      console.error('  • FFmpeg: https://ffmpeg.org/download.html');
    }
    
    if (!dependencies.ytDlp) {
      console.error('  • yt-dlp: pip install yt-dlp veya https://github.com/yt-dlp/yt-dlp');
    }

    console.error('\n💡 Development için kontrolleri atlamak için:');
    console.error('   server/.env dosyasına SKIP_SYSTEM_CHECK=true ekleyin');
    console.error('   veya: SET SKIP_SYSTEM_CHECK=true && npm run server:dev');

    console.error('\n' + '='.repeat(80) + '\n');
    
    return false;
  }

  console.log('✅ Tüm sistem bağımlılıkları mevcut');
  return true;
}

module.exports = {
  checkPython,
  checkFFmpeg,
  checkYtDlp,
  checkSystemDependencies,
  validateSystemDependencies
};

