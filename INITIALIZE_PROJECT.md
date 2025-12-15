# Proje Başlatma Rehberi

## ⚠️ Önemli: Android/iOS Klasörleri Eksik

Mevcut projede Android ve iOS native klasörleri yok. React Native projesi için bu klasörler gereklidir.

## 🚀 Çözüm: React Native Projesini Başlatma

### Yöntem 1: Yeni Proje Oluşturup Dosyaları Taşıma (Önerilen)

1. **Yeni bir React Native projesi oluşturun:**

```bash
npx @react-native-community/cli@latest init SoftielPlayNew --version 0.76.5
```

2. **Oluşturulan projeden android ve ios klasörlerini mevcut projeye kopyalayın:**

```bash
# Windows PowerShell için:
Copy-Item -Path "SoftielPlayNew\android" -Destination "." -Recurse
Copy-Item -Path "SoftielPlayNew\ios" -Destination "." -Recurse
```

3. **Geçici projeyi silin:**

```bash
Remove-Item -Path "SoftielPlayNew" -Recurse -Force
```

4. **react-native-config için Android yapılandırması:**

`android/app/build.gradle` dosyasını açın ve `android` bloğuna ekleyin:

```gradle
android {
    ...
    
    defaultConfig {
        ...
        resValue "string", "build_config_package", "com.softielplay"
    }
}
```

`android/settings.gradle` dosyasına ekleyin:

```gradle
include ':react-native-config'
project(':react-native-config').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-config/android')
```

`android/app/build.gradle` dosyasında `dependencies` bloğuna:

```gradle
dependencies {
    ...
    implementation project(':react-native-config')
}
```

5. **iOS için (sadece Mac):**

`ios/Podfile` dosyasının en üstüne ekleyin:

```ruby
require_relative '../node_modules/react-native-config/scripts/react_native_config.rb'
```

Sonra:

```bash
cd ios
pod install
cd ..
```

### Yöntem 2: Manuel Oluşturma (Gelişmiş)

Android ve iOS klasörlerini manuel oluşturmak çok karmaşık. Yöntem 1'i öneriyoruz.

## 📝 Sonraki Adımlar

1. Android/iOS klasörlerini ekledikten sonra
2. `NEXT_STEPS.md` dosyasındaki adımları takip edin
3. `npm start` ile Metro bundler'ı başlatın
4. `npm run android` veya `npm run ios` ile uygulamayı çalıştırın

## 🔍 Kontrol

Android ve iOS klasörleri oluşturulduktan sonra şu dosyalar olmalı:

- `android/app/build.gradle`
- `android/settings.gradle`
- `ios/Podfile`
- `ios/SoftielPlay.xcworkspace` (pod install sonrası)




