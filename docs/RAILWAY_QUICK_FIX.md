# Railway Deployment - Hızlı Çözüm

## ⚠️ KRİTİK: Bu Adımları Sırayla Yapın!

### 1. Root Directory Ayarlayın
- Railway dashboard → Service → Settings
- "Root Directory" = `server`
- **Save butonuna tıklayın!**

### 2. Environment Variables Ekle (ZORUNLU - EN ÖNEMLİSİ!)
- Railway dashboard → Service → Variables
- **"New Variable" butonuna tıklayın**
- Şu iki variable'ı tek tek ekleyin:
  
  **Variable 1:**
  - Key: `NIXPACKS_NODE_VERSION`
  - Value: `20`
  - **Add** butonuna tıklayın
  
  **Variable 2:**
  - Key: `SKIP_SYSTEM_CHECK`
  - Value: `true`
  - **Add** butonuna tıklayın

- **`NIXPACKS_NODE_VERSION=20` olmadan Node.js 18 kullanılır ve hata alırsınız!**
- **Her iki variable'ın da eklendiğini kontrol edin!**

### 3. Deploy
- Railway otomatik olarak yeniden deploy edecek
- Veya "Redeploy" butonuna tıklayın
- **Deploy loglarında `nodejs-20_x` görmelisiniz, `nodejs_18` değil!**

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
