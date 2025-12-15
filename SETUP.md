# Softiel Play - Kurulum Rehberi

## Gereksinimler

- Node.js 18+
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için - sadece Mac)
- CocoaPods (iOS için)

## Kurulum Adımları

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. iOS Bağımlılıkları (Sadece iOS için)

```bash
cd ios
pod install
cd ..
```

### 3. Spotify API Credentials

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)'a gidin
2. Yeni bir uygulama oluşturun
3. Client ID ve Client Secret'ı alın
4. `.env` dosyası oluşturun:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 4. Firebase Kurulumu (Opsiyonel)

Eğer Firebase kullanmak istiyorsanız:

1. [Firebase Console](https://console.firebase.google.com/)'da proje oluşturun
2. Android için `google-services.json` dosyasını `android/app/` klasörüne ekleyin
3. iOS için `GoogleService-Info.plist` dosyasını `ios/` klasörüne ekleyin

**Not:** Local storage (MMKV) kullanıyorsanız Firebase gerekmez.

### 5. Android Native Modüller

Bazı native modüller için ek yapılandırma gerekebilir:

#### react-native-track-player

`android/app/src/main/java/.../MainApplication.java` dosyasına ekleyin:

```java
import com.doublesymmetry.trackplayer.module.TrackPlayerModule;
```

#### react-native-mmkv

Otomatik link edilir, ek yapılandırma gerekmez.

### 6. iOS Native Modüller

iOS için Podfile otomatik olarak yapılandırılır. Eğer sorun yaşarsanız:

```bash
cd ios
pod deintegrate
pod install
cd ..
```

## Çalıştırma

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## Önemli Notlar

### YouTube API

YouTube'dan ses çekmek için şu anda placeholder implementasyon var. Production için:

1. **Innertube API**: Daha stabil ama sürekli güncellenmesi gerekir
2. **yt-dlp Native Module**: React Native için native module wrapper gerekir
3. **Backend Proxy**: En güvenli yöntem, backend'de yt-dlp çalıştırıp API sunmak

### Yasal Uyarı

YouTube'un hizmet şartlarına göre içerik indirmek yasak olabilir. Bu uygulama sadece eğitim amaçlıdır.

## Sorun Giderme

### Metro bundler hatası

```bash
npm start -- --reset-cache
```

### Android build hatası

```bash
cd android
./gradlew clean
cd ..
```

### iOS build hatası

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```




