# Softiel Play - Proje Yapısı

## Klasör Yapısı

```
SoftielPlay/
├── src/
│   ├── components/          # Reusable UI bileşenleri
│   ├── constants/           # Sabitler (API URL'leri, storage keys)
│   │   └── index.ts
│   ├── hooks/               # Custom React hooks
│   ├── navigation/          # Navigation yapılandırması
│   │   └── AppNavigator.tsx
│   ├── screens/             # Ekranlar
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── PlaylistScreen.tsx
│   │   └── PlayerScreen.tsx
│   ├── services/            # Business logic servisleri
│   │   ├── spotify.service.ts
│   │   ├── youtube.service.ts
│   │   ├── player.service.ts
│   │   ├── firebase.service.ts
│   │   └── download.service.ts
│   ├── store/               # Zustand state management
│   │   ├── player.store.ts
│   │   ├── playlist.store.ts
│   │   └── track.store.ts
│   ├── types/               # TypeScript type tanımlamaları
│   │   ├── index.ts
│   │   └── navigation.ts
│   ├── utils/               # Yardımcı fonksiyonlar
│   │   ├── storage.ts
│   │   └── innertube.ts
│   └── ...
├── android/                 # Android native kod
├── ios/                     # iOS native kod
├── App.tsx                  # Ana uygulama bileşeni
├── index.js                 # Entry point
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
└── README.md
```

## Ana Bileşenler

### Services (Servisler)

- **spotify.service.ts**: Spotify Web API ile müzik arama
- **youtube.service.ts**: YouTube'dan video arama ve ses URL'i alma
- **player.service.ts**: react-native-track-player wrapper
- **firebase.service.ts**: Firestore ile playlist senkronizasyonu (opsiyonel)
- **download.service.ts**: Şarkıları offline için indirme

### Store (State Management)

- **player.store.ts**: Çalma durumu, queue, repeat/shuffle
- **playlist.store.ts**: Playlist CRUD işlemleri
- **track.store.ts**: Track yönetimi ve indirme durumu

### Screens (Ekranlar)

- **HomeScreen**: Ana sayfa, öneriler, son çalınanlar
- **SearchScreen**: Spotify API ile arama
- **LibraryScreen**: Kullanıcının playlistleri
- **PlaylistScreen**: Playlist detayı ve şarkı listesi
- **PlayerScreen**: Full-screen player ekranı

## Veri Akışı

1. **Arama**: Kullanıcı arama yapar → Spotify API'den sonuçlar gelir
2. **Çalma**: Kullanıcı şarkı seçer → YouTube'dan ses URL'i alınır → TrackPlayer'a eklenir
3. **İndirme**: Kullanıcı indirir → YouTube'dan ses çekilir → Local storage'a kaydedilir
4. **Playlist**: Playlist oluşturulur → MMKV'ye kaydedilir (veya Firebase'e)

## Storage Yapısı

### MMKV (Local Storage)

- `tracks`: Tüm track'ler
- `playlists`: Tüm playlist'ler
- `downloaded_tracks`: İndirilen track ID'leri
- `settings`: Uygulama ayarları

### Firebase (Opsiyonel)

- `playlists/{userId}/user_playlists/{playlistId}`: Kullanıcı playlist'leri

## API Entegrasyonları

### Spotify Web API

- **Endpoint**: `https://api.spotify.com/v1`
- **Auth**: Client Credentials Flow
- **Kullanım**: Sadece arama (preview URL yok)

### YouTube Innertube API

- **Endpoint**: `https://www.youtube.com/youtubei/v1`
- **Kullanım**: Video arama ve ses URL'i alma
- **Not**: Production'da daha stabil bir çözüm gerekebilir

## Özellikler

✅ Spotify benzeri arayüz  
✅ Spotify API ile arama  
✅ YouTube'dan ses çekme  
✅ Offline dinleme  
✅ Playlist yönetimi  
✅ Reklamsız  
✅ Cross-platform (iOS + Android)  

## Eksikler / Geliştirilecekler

- [ ] YouTube arama implementasyonu (şu anda placeholder)
- [ ] Innertube API stabilizasyonu
- [ ] Offline mod için daha iyi hata yönetimi
- [ ] Şarkı önizleme (30 saniye)
- [ ] Kullanıcı profil yönetimi (Firebase Auth)
- [ ] Şarkı önerileri algoritması
- [ ] Dark/Light tema
- [ ] Çoklu dil desteği




