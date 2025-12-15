# Sonraki Adımlar - Softiel Play

## ✅ Tamamlananlar

- [x] Proje yapısı oluşturuldu
- [x] Bağımlılıklar yüklendi
- [x] Spotify API credentials `.env` dosyasına eklendi
- [x] react-native-config paketi yüklendi

## 📋 Şimdi Yapmanız Gerekenler

### 1. Android Yapılandırması

#### a) Android Build Gradle'a react-native-config ekleyin

`android/app/build.gradle` dosyasını açın ve `android` bloğunun içine şunu ekleyin:

```gradle
android {
    ...
    
    defaultConfig {
        ...
        // react-native-config için
        resValue "string", "build_config_package", "com.softielplay"
    }
}
```

#### b) Android Settings Gradle'a ekleyin

`android/settings.gradle` dosyasını açın ve en üste şunu ekleyin:

```gradle
include ':react-native-config'
project(':react-native-config').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-config/android')
```

#### c) Android App Build Gradle'a dependency ekleyin

`android/app/build.gradle` dosyasında `dependencies` bloğuna:

```gradle
dependencies {
    ...
    implementation project(':react-native-config')
}
```

### 2. iOS Yapılandırması (Sadece Mac/iOS için)

#### a) Podfile'a ekleyin

`ios/Podfile` dosyasını açın ve en üste şunu ekleyin:

```ruby
require_relative '../node_modules/react-native-config/scripts/react_native_config.rb'
```

#### b) Pod install çalıştırın

```bash
cd ios
pod install
cd ..
```

### 3. .env Dosyasını Kontrol Edin

`.env` dosyanızın şu formatta olduğundan emin olun:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Önemli:** `.env` dosyası `.gitignore`'da olmalı (zaten ekledik).

### 4. Metro Bundler'ı Başlatın

```bash
npm start
```

### 5. Uygulamayı Çalıştırın

#### Android için:
```bash
npm run android
```

#### iOS için (sadece Mac):
```bash
npm run ios
```

## 🔧 Sorun Giderme

### react-native-config çalışmıyorsa

1. Metro bundler'ı cache ile temizleyin:
```bash
npm start -- --reset-cache
```

2. Android için:
```bash
cd android
./gradlew clean
cd ..
```

3. iOS için:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Spotify API hatası alıyorsanız

1. `.env` dosyasının doğru formatta olduğundan emin olun
2. Spotify Developer Dashboard'da uygulamanızın aktif olduğunu kontrol edin
3. Client ID ve Secret'ın doğru olduğundan emin olun

## 📱 Test Etme

1. Uygulama açıldığında Search ekranına gidin
2. Bir şarkı adı yazın ve arayın
3. Spotify API'den sonuçlar gelmeli

## ⚠️ Önemli Notlar

- YouTube implementasyonu şu anda placeholder. Production için backend proxy veya native module gerekir.
- Firebase kullanmıyorsanız, playlist'ler sadece local storage'da (MMKV) saklanır.
- İlk çalıştırmada native modüllerin build edilmesi biraz zaman alabilir.

## 🚀 Sonraki Geliştirmeler

- [ ] YouTube arama implementasyonu
- [ ] Offline indirme özelliği testi
- [ ] Player kontrolleri testi
- [ ] Playlist oluşturma/silme testi




