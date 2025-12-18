# Railway Deployment Sorun Giderme

## "There was an error deploying from source" Hatası

Bu hata genellikle şu sebeplerden kaynaklanır:

### 1. Root Directory Yanlış Ayarlanmış

**Sorun:** Railway repository'nin root'unu arıyor, ama `package.json` `server` klasöründe.

**Çözüm:**
1. Railway dashboard'da service'inize tıklayın
2. "Settings" sekmesine gidin
3. "Root Directory" alanını bulun
4. Değeri `server` olarak ayarlayın
5. "Save" butonuna tıklayın
6. Yeniden deploy edin

### 2. Sistem Bağımlılıkları Hatası

**Sorun:** `checkSystem.js` Python ve yt-dlp arıyor ama Railway'da kurulu değil.

**Çözüm:**
1. Railway dashboard'da "Variables" sekmesine gidin
2. `SKIP_SYSTEM_CHECK` variable'ını ekleyin:
   ```
   SKIP_SYSTEM_CHECK=true
   ```
3. Yeniden deploy edin

### 3. Build Komutu Hatası

**Sorun:** `npm install` başarısız oluyor.

**Çözüm:**
1. Railway dashboard'da "Settings" sekmesine gidin
2. "Build Command" alanını kontrol edin
3. Değer `npm install` olmalı
4. Eğer farklıysa, düzeltin ve kaydedin

### 4. Package.json Bulunamıyor

**Sorun:** Railway `package.json` dosyasını bulamıyor.

**Çözüm:**
1. Root Directory'nin `server` olarak ayarlandığından emin olun
2. `server/package.json` dosyasının mevcut olduğunu kontrol edin
3. Git repository'de `server/package.json` dosyasının commit edildiğinden emin olun

### 5. Port Hatası

**Sorun:** Port zaten kullanımda veya yanlış port.

**Çözüm:**
1. Railway otomatik olarak PORT environment variable'ını ayarlar
2. Manuel olarak `PORT=3000` eklemeyin (Railway otomatik yapar)
3. Sadece `SKIP_SYSTEM_CHECK=true` ekleyin

## Node.js Versiyon Hatası (KRİTİK!)

**Sorun:** Railway Node.js 18 kullanıyor ama paketler Node.js 20+ gerektiriyor.

**Çözüm (3 ADIM ZORUNLU):**
1. **Environment Variable Ekle (EN ÖNEMLİSİ!):**
   - Railway dashboard → "Variables" sekmesi
   - `NIXPACKS_NODE_VERSION=20` ekleyin
   - **Bu olmadan Node.js 18 kullanılır!**

2. `server/.nvmrc` dosyası mevcut (içinde `20` yazıyor)

3. `server/package.json`'da `engines` field'ı mevcut (`"node": "20.x"`)

**Not:** `NIXPACKS_NODE_VERSION` environment variable'ı olmadan diğer yöntemler çalışmayabilir!

## Python Bulunamıyor Hatası

**Sorun:** `yt-dlp-exec` paketi Python gerektiriyor ama Railway'da kurulu değil.

**Çözüm:**
1. `server/nixpacks.toml` dosyası mevcut (Python ve FFmpeg kurulumu için)
2. Bu dosya Railway'a Python ve yt-dlp kurmasını söylüyor
3. Railway otomatik olarak Python ve yt-dlp kuracak

## "attribute 'nodejs-20_x' missing" Hatası

**Sorun:** `nixpacks.toml` dosyasında `pkgs.nodejs-20_x` belirtilmiş ama nixpkgs versiyonunda yok.

**Çözüm:**
1. `nixpacks.toml` dosyası güncellendi - Node.js artık burada belirtilmiyor
2. Node.js versiyonu **SADECE** `NIXPACKS_NODE_VERSION=20` environment variable ile belirleniyor
3. `NIXPACKS_NODE_VERSION=20` environment variable'ının eklendiğinden emin olun
4. `nixpacks.toml` sadece Python ve FFmpeg için kullanılıyor

## Adım Adım Düzeltme

1. **Root Directory Kontrolü:**
   ```
   Settings → Root Directory = "server"
   ```

2. **Environment Variables (ZORUNLU!):**
   ```
   NIXPACKS_NODE_VERSION=20
   SKIP_SYSTEM_CHECK=true
   ```
   **⚠️ `NIXPACKS_NODE_VERSION=20` olmadan Node.js 18 kullanılır!**

3. **Node.js Versiyonu:**
   - `server/.nvmrc` dosyası mevcut (içinde `20`)
   - `server/package.json`'da `engines.node: "20.x"` mevcut
   - **AMA `NIXPACKS_NODE_VERSION=20` environment variable'ı zorunlu!**

4. **Python Kurulumu:**
   - `server/nixpacks.toml` dosyası mevcut
   - Railway otomatik olarak Python ve yt-dlp kuracak
   - Python setup phase'de kurulacak, install phase'de yt-dlp yüklenecek

3. **Deploy Loglarını Kontrol:**
   - Railway dashboard'da "Deployments" sekmesine gidin
   - Son deployment'a tıklayın
   - Logları kontrol edin
   - Hata mesajını okuyun

4. **Yeniden Deploy:**
   - "Redeploy" butonuna tıklayın
   - Veya GitHub'a yeni commit push edin

## Yaygın Hata Mesajları

### "Cannot find module"
- Root Directory yanlış ayarlanmış
- `server` klasörü root olarak ayarlanmalı

### "Command failed: npm install"
- Dependencies sorunlu olabilir
- Logları kontrol edin
- `package.json` dosyasını kontrol edin

### "System dependencies not found"
- `SKIP_SYSTEM_CHECK=true` ekleyin
- Production'da sistem kontrolü gerekmez

### "Port already in use"
- Railway otomatik port atar
- PORT variable'ını manuel eklemeyin

## Test Etme

Deploy başarılı olduktan sonra:

1. **Health Check:**
   ```bash
   curl https://your-app.railway.app/health
   ```
   Cevap: `{"status":"ok","message":"Server is running"}`

2. **Search Endpoint Test:**
   ```bash
   curl "https://your-app.railway.app/api/search?q=test"
   ```

## Hala Çalışmıyorsa

1. Railway dashboard'da "Logs" sekmesini kontrol edin
2. Hata mesajını tam olarak okuyun
3. Railway support'a başvurun: https://railway.app/help


