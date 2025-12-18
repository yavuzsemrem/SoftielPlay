# Railway App Deployment Rehberi

## ⚠️ KRİTİK: Bu Adımları Sırayla Yapın!

### 1. Root Directory Ayarlayın (ZORUNLU - EN ÖNEMLİSİ!)
**⚠️ BU ADIM OLMADAN DEPLOYMENT BAŞARISIZ OLUR!**

- Railway dashboard → **App service** → **Settings**
- "Root Directory" alanını bulun
- Değeri **`app`** olarak ayarlayın (tırnak işareti olmadan, sadece `app`)
- **"Save" butonuna tıklayın!**
- **Deploy loglarında "Found workspace with 2 packages" görüyorsanız, root directory ayarı çalışmıyor demektir!**
- **Doğru ayarlandığında deploy loglarında "Detected Node" ve "Using npm package manager" görürsünüz ama "Found workspace" görmezsiniz!**

### 2. Environment Variables Ekle (ZORUNLU!)
- Railway dashboard → App service → Variables
- **"New Variable" butonuna tıklayın**
- Şu variable'ı ekleyin:
  
  **Variable:**
  - Key: `NIXPACKS_NODE_VERSION`
  - Value: `20`
  - **Add** butonuna tıklayın

- **`NIXPACKS_NODE_VERSION=20` olmadan Node.js 22 kullanılır ve engine hatası alırsınız!**

### 3. Deploy
- Railway otomatik olarak yeniden deploy edecek
- Veya "Redeploy" butonuna tıklayın
- **Deploy loglarında `nodejs-20_x` görmelisiniz, `nodejs_22` değil!**

## Sorun Giderme

### "yt-dlp-exec" Python Hatası

**Sorun:** `yt-dlp-exec` paketi Python gerektiriyor ama app için Python gerekmiyor.

**Neden:** Railway root dizinden build yapıyorsa, root'taki `package-lock.json` workspaces içeriyor ve server bağımlılıkları da kurulmaya çalışılıyor.

**Çözüm:**
1. Railway'de Root Directory = `app` olarak ayarlayın
2. `app/nixpacks.toml` dosyası mevcut - bu dosya app dizinine geçip sadece app'in bağımlılıklarını kuruyor
3. Bu sayede server bağımlılıkları (`yt-dlp-exec`) kurulmayacak

### Node.js Versiyon Hatası

**Sorun:** `EBADENGINE Unsupported engine` hatası - Node.js 22 kullanılıyor ama 20.x gerekiyor.

**Çözüm:**
1. Railway dashboard → Variables
2. `NIXPACKS_NODE_VERSION=20` ekleyin
3. Deploy'u yeniden başlatın

### Workspaces Hatası

**Sorun:** Root'taki `package-lock.json` workspaces içeriyor ve server bağımlılıkları kurulmaya çalışılıyor.

**Çözüm:**
1. Railway'de Root Directory = `app` olarak ayarlayın
2. `app/nixpacks.toml` dosyası app dizinine geçip sadece app'in bağımlılıklarını kuruyor
3. Root'taki workspaces ignore edilecek

## Kontrol Listesi

✅ Root Directory: `app`  
✅ `NIXPACKS_NODE_VERSION=20` (ZORUNLU!)  
✅ `app/nixpacks.toml` dosyası mevcut  
✅ `app/.nvmrc` dosyası mevcut (içinde `20`)  
✅ `app/package.json`'da `engines.node: "20.x"`  
✅ `app/railway.json` dosyası mevcut  

## Beklenen Sonuç

Deploy loglarında şunu görmelisiniz:
```
setup │ nodejs-20_x
install │ cd app && npm install --omit=dev
```

Eğer hala `nodejs_22` görüyorsanız:
- `NIXPACKS_NODE_VERSION=20` environment variable'ının eklendiğinden emin olun
- Railway dashboard'da "Variables" sekmesini kontrol edin
- Deploy'u yeniden başlatın

Eğer hala `yt-dlp-exec` hatası alıyorsanız:
- Root Directory'nin `app` olarak ayarlandığından emin olun
- Railway dashboard'da "Settings" sekmesini kontrol edin
- Deploy'u yeniden başlatın
