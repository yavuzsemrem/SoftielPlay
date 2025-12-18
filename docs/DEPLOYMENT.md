# Deployment Rehberi

Bu rehber, SoftielPlay uygulamasını production ortamına deploy etmek için gereken adımları içerir.

## Hızlı Başlangıç

1. **Backend'i cloud servise deploy edin** (Railway, Render, vb.)
2. **Backend URL'ini kopyalayın** (örn: `https://your-app.railway.app`)
3. **Frontend'de API URL'ini ayarlayın:**
   - `app/.env` dosyası oluşturun: `EXPO_PUBLIC_API_URL=https://your-app.railway.app`
   - Veya `app/app.json` içinde `extra.apiUrl` değerini güncelleyin
4. **Uygulamayı yeniden başlatın**

## Backend Deployment

Production ortamında backend'i cloud servise deploy etmeniz gerekiyor. Aşağıdaki **tamamen ücretsiz** seçeneklerden birini kullanabilirsiniz:

### Seçenek 1: Railway (Önerilen - Kolay ve Ücretsiz)

**Ücretsiz Tier:**
- $5 ücretsiz kredi/ay (yeterli)
- Kolay kurulum
- Otomatik deployment

1. **Railway'a Kayıt Olun:**
   - https://railway.app adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje Oluşturun:**
   - "New Project" → "Deploy from GitHub repo"
   - `SoftielPlay` repository'sini seçin
   - Service oluşturulduktan sonra devam edin

3. **Root Directory Ayarlayın (ÇOK ÖNEMLİ!):**
   - Railway dashboard'da oluşturduğunuz service'e tıklayın
   - "Settings" sekmesine gidin
   - "Root Directory" alanını bulun
   - Değeri `server` olarak ayarlayın (tırnak işareti olmadan)
   - "Save" butonuna tıklayın
   - **Bu adım olmadan deployment başarısız olur!**

4. **Environment Variables (ÇOK ÖNEMLİ!):**
   - Railway dashboard'da "Variables" sekmesine gidin
   - Şu environment variable'ları ekleyin:
     ```
     NIXPACKS_NODE_VERSION=20
     SKIP_SYSTEM_CHECK=true
     ```
   **Notlar:**
   - `NIXPACKS_NODE_VERSION=20` zorunlu! Bu olmadan Node.js 18 kullanılır
   - `PORT` variable'ını eklemeyin, Railway otomatik atar
   - `SKIP_SYSTEM_CHECK=true` olmalı çünkü Railway'da sistem kontrolü gerekmez

5. **Deploy:**
   - Railway otomatik olarak deploy edecek
   - Eğer hata alırsanız, "Deployments" sekmesinden logları kontrol edin
   - Deploy tamamlandıktan sonra "Settings" → "Generate Domain" ile URL oluşturun
   - URL'i kopyalayın (örn: `https://your-app.railway.app`)

**⚠️ KRİTİK:** `NIXPACKS_NODE_VERSION=20` environment variable'ını eklemeden deploy etmeyin! Bu olmadan Node.js 18 kullanılır ve hata alırsınız.

**⚠️ Sorun Giderme:** 
- Hızlı çözüm için: `docs/RAILWAY_QUICK_FIX.md`
- Detaylı sorun giderme için: `docs/RAILWAY_TROUBLESHOOTING.md`

### Seçenek 2: Fly.io (Ücretsiz - Daha Fazla Kaynak)

**Ücretsiz Tier:**
- 3 shared-cpu-1x VM (ücretsiz)
- 160GB outbound data transfer/ay
- Kolay kurulum

1. **Fly.io'ya Kayıt Olun:**
   - https://fly.io adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Fly CLI Kurulumu:**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

3. **Login:**
   ```bash
   fly auth login
   ```

4. **Proje Oluştur:**
   ```bash
   cd server
   fly launch
   ```
   - App name: `softielplay-api` (veya istediğiniz isim)
   - Region: En yakın bölgeyi seçin
   - PostgreSQL: No (şimdilik gerek yok)

5. **Deploy:**
   ```bash
   fly deploy
   ```

6. **URL'i Al:**
   ```bash
   fly open
   ```
   Veya dashboard'dan URL'i kopyalayın: `https://your-app.fly.dev`

### Seçenek 3: Cyclic (Ücretsiz - Serverless)

**Ücretsiz Tier:**
- Sınırsız deployment
- Otomatik scaling
- Kolay kurulum

1. **Cyclic'a Kayıt Olun:**
   - https://cyclic.sh adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje:**
   - "New App" → GitHub repo seçin
   - Root Directory: `server`
   - Framework: Node.js

3. **Environment Variables:**
   - Dashboard'dan environment variables ekleyin

4. **Deploy:**
   - Otomatik deploy edilecek
   - URL: `https://your-app.cyclic.app`

### Seçenek 4: Koyeb (Ücretsiz - Avrupa Sunucuları)

**Ücretsiz Tier:**
- 512MB RAM
- 1GB disk
- Sınırsız bandwidth

1. **Koyeb'a Kayıt Olun:**
   - https://www.koyeb.com adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni App:**
   - "Create App" → "GitHub" seçin
   - Repository: `SoftielPlay`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Deploy:**
   - Otomatik deploy edilecek
   - URL: `https://your-app.koyeb.app`

### Seçenek 5: Render (Alternatif Hesap)

Eğer Render'da zaten bir uygulamanız varsa:
- Farklı bir email ile yeni hesap açabilirsiniz
- Veya mevcut hesabınızda farklı bir proje oluşturabilirsiniz (ücretsiz tier'da birden fazla proje olabilir)

1. **Railway'a Kayıt Olun:**
   - https://railway.app adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje Oluşturun:**
   - "New Project" → "Deploy from GitHub repo"
   - `SoftielPlay` repository'sini seçin
   - `server` klasörünü root olarak ayarlayın

3. **Environment Variables:**
   - Railway dashboard'da "Variables" sekmesine gidin
   - Gerekli environment variable'ları ekleyin:
     ```
     PORT=3000
     SKIP_SYSTEM_CHECK=false
     ```

4. **Deploy:**
   - Railway otomatik olarak deploy edecek
   - Deploy tamamlandıktan sonra URL'i kopyalayın (örn: `https://your-app.railway.app`)

### Seçenek 6: Vercel (Serverless Functions - Ücretsiz)

**Not:** Vercel serverless functions kullanır, bu yüzden `yt-dlp` gibi sistem bağımlılıkları sorun çıkarabilir. Diğer seçenekler daha uygun.

1. **Vercel'e Kayıt Olun:**
   - https://vercel.com adresine gidin

2. **Proje Import:**
   - GitHub repository'yi import edin
   - Root Directory: `server`

3. **Deploy:**
   - Vercel otomatik deploy edecek

## Hangi Servisi Seçmeliyim?

| Servis | Ücretsiz Tier | Kolaylık | Önerilen |
|--------|---------------|----------|----------|
| **Railway** | $5 kredi/ay | ⭐⭐⭐⭐⭐ | ✅ En kolay |
| **Fly.io** | 3 VM ücretsiz | ⭐⭐⭐⭐ | ✅ En fazla kaynak |
| **Cyclic** | Sınırsız | ⭐⭐⭐⭐ | ✅ Serverless |
| **Koyeb** | 512MB RAM | ⭐⭐⭐ | ✅ Avrupa sunucuları |
| **Render** | 1 proje | ⭐⭐⭐⭐ | ⚠️ Zaten kullanıyorsunuz |

**Öneri:** Railway veya Fly.io ile başlayın. Railway daha kolay, Fly.io daha fazla kaynak sunuyor.

## Frontend Configuration

Backend deploy edildikten sonra, frontend'de API URL'ini ayarlamanız gerekiyor:

### Development (Local)

`app/app.json` dosyasında `extra.apiUrl` değerini güncelleyin:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

Fiziksel cihazda test ediyorsanız, bilgisayarınızın IP adresini kullanın:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.93:3000"
    }
  }
}
```

### Production

Production build'de environment variable kullanın:

1. **EAS Build için:**
   - `app/.env.production` dosyası oluşturun:
     ```
     EXPO_PUBLIC_API_URL=https://your-backend.railway.app
     ```

2. **Expo Go için:**
   - `app/app.json` dosyasında `extra.apiUrl` değerini production URL ile değiştirin:
     ```json
     {
       "expo": {
         "extra": {
           "apiUrl": "https://your-backend.railway.app"
         }
       }
     }
     ```

## Environment Variables Öncelik Sırası

1. `EXPO_PUBLIC_API_URL` (en yüksek öncelik)
2. `app.json` → `extra.apiUrl`
3. Metro bundler host (development, fiziksel cihaz)
4. `localhost:3000` (development, simülatör/emülatör)

## Test Etme

1. Backend'i deploy edin
2. Backend URL'inin çalıştığını kontrol edin:
   ```bash
   curl https://your-backend.railway.app/health
   ```
3. Frontend'de API URL'ini ayarlayın
4. Uygulamayı yeniden başlatın
5. Arama özelliğini test edin

## Sorun Giderme

### Network Error
- Backend URL'inin doğru olduğundan emin olun
- CORS ayarlarını kontrol edin (backend'de `cors()` middleware var)
- Backend'in çalıştığından emin olun

### Environment Variable Çalışmıyor
- Expo uygulamasını tamamen kapatıp yeniden açın
- `npx expo start --clear` ile cache'i temizleyin
- `app.json` değişikliklerinden sonra uygulamayı yeniden build edin

