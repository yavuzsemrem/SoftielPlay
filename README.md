# Softiel Play

Kişisel reklamsız müzik uygulaması - React Native ile geliştirilmiş cross-platform mobil uygulama.

## Özellikler

- 🎵 Spotify benzeri arayüz
- 🚫 %100 reklamsız
- 📱 Offline dinleme
- 🎶 Playlist yönetimi
- 🔍 Spotify API ile arama
- 🎬 YouTube'dan ses çekme
- 💾 Yerel saklama (MMKV)

## Teknoloji Stack

- React Native 0.79+ (Bare Workflow)
- TypeScript
- Zustand (State Management)
- React Navigation v7
- react-native-track-player
- Firebase Firestore
- react-native-mmkv

## Kurulum

```bash
npm install
cd ios && pod install && cd ..
npm run android  # veya npm run ios
```

## Yapılandırma

1. Firebase projesi oluşturun ve `google-services.json` (Android) ve `GoogleService-Info.plist` (iOS) dosyalarını ekleyin
2. Spotify API credentials için `.env` dosyası oluşturun

