# iPhone'da Test Etme Seçenekleri

## ⚠️ Sorun: Windows'ta iOS Geliştirme Yapılamaz

iOS uygulaması geliştirmek ve test etmek için **Mac bilgisayar ve Xcode** gereklidir. Windows'ta bu mümkün değil.

## 🎯 Çözüm Seçenekleri

### Seçenek 1: Expo'ya Geçiş (Önerilen - En Kolay)

Expo Go uygulaması ile iPhone'unuzda direkt test edebilirsiniz. Mac gerekmez!

**Avantajlar:**
- ✅ Mac gerekmez
- ✅ iPhone'da direkt test
- ✅ Hızlı geliştirme
- ✅ QR kod ile kolay test

**Dezavantajlar:**
- ⚠️ Bazı native modüller sınırlı (react-native-track-player çalışır)
- ⚠️ Proje yapısını Expo'ya uyarlamak gerekir

**Nasıl yapılır:**
1. Expo SDK'ya geçiş yapılır
2. `expo start` ile QR kod oluşturulur
3. iPhone'da Expo Go uygulaması ile QR kod taranır
4. Uygulama iPhone'da açılır

### Seçenek 2: Mac Kullanma

- Mac bilgisayar bulun/kullanın
- Xcode yükleyin
- iOS klasörünü oluşturun
- `npm run ios` ile test edin

### Seçenek 3: Android Emulator (Şimdilik)

iPhone'unuz yoksa Android emulator ile test edebilirsiniz:

```bash
# Android Studio'yu yükleyin
# Emulator oluşturun
npm run android
```

### Seçenek 4: Cloud Mac Servisleri (Ücretli)

MacinCloud, AWS Mac Instance gibi servisler kullanabilirsiniz (ücretli).

## 💡 Öneri: Expo'ya Geçiş

iPhone'da test etmek için en pratik çözüm Expo'ya geçmek. İsterseniz projeyi Expo'ya uyarlayabilirim.

**Expo'ya geçiş yapmak ister misiniz?**

Eğer evet derseniz:
1. Expo SDK eklerim
2. Gerekli yapılandırmaları yaparım
3. Expo Go ile test edebilirsiniz

**Veya:** Android emulator ile şimdilik test edebilir, iOS için daha sonra Mac bulduğunuzda yapabilirsiniz.




