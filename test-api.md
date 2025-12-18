# API Test Komutları

## Railway URL'yi Bulma
1. Railway dashboard → Service → Settings → Domains
2. Veya Deployments → son deployment → URL'yi kopyala

## Test Komutları

### 1. Health Check (Sunucu Çalışıyor mu?)
```bash
curl https://your-app.railway.app/health
```

**Beklenen Cevap:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Arama Endpoint'i (YouTube Arama)
```bash
curl "https://your-app.railway.app/api/search?q=test"
```

**Beklenen Cevap:**
```json
{
  "success": true,
  "query": "test",
  "count": 15,
  "results": [
    {
      "videoId": "...",
      "title": "...",
      "artist": "...",
      "thumbnail": "...",
      "duration": "3:45"
    }
  ]
}
```

### 3. PowerShell ile Test (Windows)
```powershell
# Health check
Invoke-WebRequest -Uri "https://your-app.railway.app/health" | Select-Object -ExpandProperty Content

# Arama
Invoke-WebRequest -Uri "https://your-app.railway.app/api/search?q=test" | Select-Object -ExpandProperty Content
```

### 4. Postman veya Insomnia
- **Method:** GET
- **URL:** `https://your-app.railway.app/api/search?q=test`
- **Headers:** (Gerekli değil, CORS açık)

## Hata Durumları

### Eğer "yt-dlp not found" hatası alırsanız:
- Virtual environment PATH'e eklenmemiş olabilir
- Railway logs'u kontrol edin
- `/app/venv/bin/yt-dlp` dosyasının var olduğunu kontrol edin

### Eğer timeout hatası alırsanız:
- yt-dlp YouTube'a bağlanamıyor olabilir
- Railway'in internet bağlantısını kontrol edin
