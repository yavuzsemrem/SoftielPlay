# Railway Deployment - Hızlı Çözüm

## ⚠️ KRİTİK: Bu Adımları Sırayla Yapın!

### 1. Root Directory Ayarlayın
- Railway dashboard → Service → Settings
- "Root Directory" = `server`
- Save

### 2. Environment Variables Ekle (ZORUNLU!)
- Railway dashboard → Service → Variables
- Şu iki variable'ı ekleyin:
  ```
  NIXPACKS_NODE_VERSION=20
  SKIP_SYSTEM_CHECK=true
  ```
- **`NIXPACKS_NODE_VERSION=20` olmadan Node.js 18 kullanılır ve hata alırsınız!**

### 3. Deploy
- Railway otomatik olarak yeniden deploy edecek
- Veya "Redeploy" butonuna tıklayın

## Kontrol Listesi

✅ Root Directory: `server`  
✅ `NIXPACKS_NODE_VERSION=20` (EN ÖNEMLİSİ!)  
✅ `SKIP_SYSTEM_CHECK=true`  
✅ `server/nixpacks.toml` dosyası mevcut  
✅ `server/.nvmrc` dosyası mevcut (içinde `20`)  
✅ `server/package.json`'da `engines.node: "20.x"`  

## Beklenen Sonuç

Deploy loglarında şunu görmelisiniz:
```
setup │ nodejs-20_x, python311, ffmpeg
```

Eğer hala `nodejs_18` görüyorsanız:
- `NIXPACKS_NODE_VERSION=20` environment variable'ının eklendiğinden emin olun
- Railway dashboard'da "Variables" sekmesini kontrol edin
- Deploy'u yeniden başlatın
