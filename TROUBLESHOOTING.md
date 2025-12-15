# Sorun Giderme Rehberi

## Port 8081 Kullanılıyor

Eğer "Port 8081 is being used" hatası alıyorsanız:

### Windows'ta:
```powershell
# Port'u kullanan process'i bul
netstat -ano | findstr :8081

# Process'i kapat (PID'yi yukarıdaki komuttan alın)
taskkill /F /PID <PID_NUMARASI>
```

### Alternatif Port Kullan:
```bash
npx expo start --port 8082
```

## QR Kod ile Bağlanamıyor

### 1. Aynı WiFi'de Olduğunuzdan Emin Olun
- Bilgisayar ve telefon aynı WiFi ağında olmalı

### 2. Tunnel Modunu Deneyin
```bash
npx expo start --tunnel
```

### 3. Firewall Kontrolü
- Windows Firewall'un Expo'ya izin verdiğinden emin olun

### 4. Manuel IP ile Bağlan
Terminal'de gösterilen IP adresini kullanarak Expo Go'da manuel olarak bağlanın.

## Uygulama Açılmıyor / Bekliyor

### 1. Metro Bundler Cache Temizle
```bash
npx expo start --clear
```

### 2. Node Modules Temizle
```bash
rm -rf node_modules
npm install
```

### 3. Expo Cache Temizle
```bash
npx expo start -c
```

### 4. Hata Loglarını Kontrol Et
Terminal'deki hata mesajlarını kontrol edin. Genellikle:
- Eksik paket
- Import hatası
- TypeScript hatası

## React Navigation Hataları

### Gesture Handler Import
`index.js` dosyasının en üstünde olmalı:
```javascript
import 'react-native-gesture-handler';
```

### Eksik Paketler
```bash
npm install react-native-gesture-handler react-native-safe-area-context react-native-screens
```

## Spotify API Hataları

### Credentials Kontrol
`app.json` dosyasında `extra` bölümünde:
```json
"spotifyClientId": "...",
"spotifyClientSecret": "..."
```

### Expo Constants Kullanımı
Kodda `expo-constants` kullanıldığından emin olun:
```typescript
import Constants from 'expo-constants';
const clientId = Constants.expoConfig?.extra?.spotifyClientId;
```

## Expo Go'da Çalışmayan Özellikler

Bazı native modüller Expo Go'da çalışmaz:
- Custom native modules
- Bazı file system işlemleri
- Background tasks

Çözüm: `expo-dev-client` ile custom development build yapın.




