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

Production ortamında backend'i cloud servise deploy etmeniz gerekiyor. Aşağıdaki seçeneklerden birini kullanabilirsiniz:

### Seçenek 1: Railway (Önerilen - Kolay ve Ücretsiz)

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

### Seçenek 2: Render

1. **Render'a Kayıt Olun:**
   - https://render.com adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Web Service:**
   - "New" → "Web Service"
   - Repository'yi bağlayın
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables:**
   - Environment variables ekleyin

4. **Deploy:**
   - Render otomatik deploy edecek
   - URL'i kopyalayın (örn: `https://your-app.onrender.com`)

### Seçenek 3: Vercel (Serverless Functions)

1. **Vercel'e Kayıt Olun:**
   - https://vercel.com adresine gidin

2. **Proje Import:**
   - GitHub repository'yi import edin
   - Root Directory: `server`

3. **Deploy:**
   - Vercel otomatik deploy edecek

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
