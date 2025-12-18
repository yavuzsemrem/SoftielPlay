# API Test Rehberi

## 🎯 Railway URL'yi Bulma

1. **Railway Dashboard'a gidin**
2. **Service'inize tıklayın**
3. **Settings → Domains** sekmesine gidin
4. **Public Domain** URL'yi kopyalayın (örn: `your-app.up.railway.app`)
5. Veya **Deployments → son deployment → View Logs** → URL'yi kontrol edin

## ✅ Test Adımları

### 1. Health Check (Sunucu Çalışıyor mu?)

**Tarayıcıda:**
```
https://your-app.railway.app/health
```

**PowerShell'de:**
```powershell
Invoke-WebRequest -Uri "https://your-app.railway.app/health" | Select-Object -ExpandProperty Content
```

**Beklenen Cevap:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Arama Endpoint'i (YouTube Arama)

**Tarayıcıda:**
```
https://your-app.railway.app/api/search?q=test
```

**PowerShell'de:**
```powershell
Invoke-WebRequest -Uri "https://your-app.railway.app/api/search?q=test" | Select-Object -ExpandProperty Content
```

**Beklenen Cevap:**
```json
{
  "success": true,
  "query": "test",
  "count": 15,
  "results": [
    {
      "videoId": "dQw4w9WgXcQ",
      "title": "Test Video",
      "artist": "Test Artist",
      "thumbnail": "https://...",
      "duration": "3:45"
    }
  ]
}
```

### 3. Farklı Arama Terimleri Test Edin

```powershell
# Müzik arama
Invoke-WebRequest -Uri "https://your-app.railway.app/api/search?q=music" | Select-Object -ExpandProperty Content

# Türkçe arama
Invoke-WebRequest -Uri "https://your-app.railway.app/api/search?q=türkçe%20şarkı" | Select-Object -ExpandProperty Content
```

## 🔧 Sonraki Adımlar

### 1. Frontend'i API'ye Bağlayın

Frontend'deki `useSearch.js` hook'unu güncelleyin:

```javascript
// API base URL'i Railway URL'niz ile değiştirin
const API_BASE_URL = 'https://your-app.railway.app';
```

### 2. Environment Variables Kontrolü

Railway dashboard'da şu environment variable'ların olduğundan emin olun:
- ✅ `SKIP_SYSTEM_CHECK` (artık gerekli değil, kaldırabilirsiniz)
- ✅ Supabase credentials (eğer kullanıyorsanız)
- ✅ Diğer gerekli API key'ler

### 3. CORS Ayarları

Eğer frontend farklı bir domain'de ise, CORS ayarlarını kontrol edin. Şu anda `cors()` middleware'i tüm origin'lere izin veriyor, production'da sadece frontend domain'inize izin verin.

### 4. Monitoring ve Logs

- **Railway Logs:** Railway dashboard → Logs sekmesi
- **Health Check:** Düzenli olarak `/health` endpoint'ini kontrol edin
- **Error Tracking:** Hataları loglayın ve izleyin

### 5. Production Optimizasyonları

- [ ] Rate limiting ekleyin (çok fazla istek önlemek için)
- [ ] Caching ekleyin (aynı aramalar için)
- [ ] Error handling'i geliştirin
- [ ] Logging'i iyileştirin

## 🐛 Hata Durumları

### Eğer "yt-dlp not found" hatası alırsanız:
- Railway logs'u kontrol edin
- `/app/venv/bin/yt-dlp` dosyasının var olduğunu kontrol edin
- Virtual environment PATH'in doğru ayarlandığını kontrol edin

### Eğer timeout hatası alırsanız:
- yt-dlp YouTube'a bağlanamıyor olabilir
- Railway'in internet bağlantısını kontrol edin
- Timeout süresini artırmayı düşünün (şu anda 30 saniye)

### Eğer CORS hatası alırsanız:
- Frontend domain'ini CORS ayarlarına ekleyin
- `cors()` middleware'ini güncelleyin

## 📝 Test Senaryoları

1. ✅ Health check çalışıyor mu?
2. ✅ Arama endpoint'i çalışıyor mu?
3. ✅ Boş query ile hata dönüyor mu?
4. ✅ Sonuçlar doğru formatta mı?
5. ✅ Thumbnail URL'leri geçerli mi?
6. ✅ Duration formatı doğru mu?

## 🚀 Production Checklist

- [x] Deploy başarılı
- [x] Tüm bağımlılıklar kurulu
- [ ] API test edildi
- [ ] Frontend bağlandı
- [ ] Environment variables ayarlandı
- [ ] Monitoring kuruldu
- [ ] Error handling test edildi






