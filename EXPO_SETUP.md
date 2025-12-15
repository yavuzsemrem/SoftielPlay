# Expo Go Kurulum ve Kullanım Rehberi

## ✅ Tamamlananlar

- [x] Expo SDK eklendi
- [x] Proje Expo'ya uyarlandı
- [x] Native modüller Expo uyumlu alternatiflerle değiştirildi
- [x] Storage AsyncStorage'a çevrildi
- [x] Player expo-av kullanıyor
- [x] Download expo-file-system kullanıyor

## 📋 Kurulum Adımları

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Spotify Credentials'ı app.json'a Ekleyin

`app.json` dosyasını açın ve `extra` bölümündeki Spotify bilgilerini güncelleyin:

```json
"extra": {
  "spotifyClientId": "BURAYA_CLIENT_ID",
  "spotifyClientSecret": "BURAYA_CLIENT_SECRET"
}
```

### 3. Expo Go Uygulamasını İndirin

**iPhone için:**
- App Store'dan "Expo Go" uygulamasını indirin

**Android için:**
- Google Play Store'dan "Expo Go" uygulamasını indirin

### 4. Uygulamayı Başlatın

```bash
npm start
```

veya

```bash
npx expo start
```

Bu komut:
- Metro bundler'ı başlatır
- QR kod gösterir
- Terminal'de menü açar

### 5. iPhone'unuzda Test Edin

1. iPhone'unuzda Expo Go uygulamasını açın
2. QR kodu tarayın (kamera ile veya Expo Go içinden)
3. Uygulama iPhone'unuzda yüklenecek ve çalışacak

**Alternatif:** Terminal'de `i` tuşuna basarak iOS simulator'da açabilirsiniz (Mac gerekir).

## 🎯 Özellikler

✅ iPhone'da direkt test (Mac gerekmez!)  
✅ QR kod ile kolay yükleme  
✅ Hot reload (kod değişiklikleri anında yansır)  
✅ Expo Go ile ücretsiz test  

## ⚠️ Önemli Notlar

### Spotify API

Spotify credentials'ları `app.json` dosyasındaki `extra` bölümünde olmalı. `.env` dosyası Expo'da çalışmaz, `app.json` kullanılır.

### Native Modüller

Bazı native modüller Expo Go'da çalışmayabilir. Eğer sorun yaşarsanız:
- `expo-dev-client` kullanarak custom development build yapabilirsiniz
- Veya Expo Go'da çalışan alternatif paketler kullanabilirsiniz

### YouTube Implementasyonu

YouTube ses çekme özelliği şu anda placeholder. Production için backend proxy veya custom native module gerekir.

## 🔧 Sorun Giderme

### QR kod görünmüyor

```bash
npm start -- --tunnel
```

### Metro bundler hatası

```bash
npm start -- --clear
```

### Uygulama yüklenmiyor

1. iPhone ve bilgisayarın aynı WiFi'de olduğundan emin olun
2. Firewall'u kontrol edin
3. Tunnel modunu deneyin: `npm start -- --tunnel`

## 📱 Sonraki Adımlar

1. `npm start` ile uygulamayı başlatın
2. QR kodu iPhone'unuzla tarayın
3. Uygulama iPhone'unuzda açılacak
4. Test edin!

## 🚀 Production Build

Production build için:

```bash
npx expo build:ios
npx expo build:android
```

veya EAS Build kullanın:

```bash
npm install -g eas-cli
eas build
```




