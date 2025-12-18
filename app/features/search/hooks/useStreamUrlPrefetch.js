import { useEffect, useRef } from 'react';
import { getStreamUrl } from '@/features/player/services/playerApi';
import usePlayerStore from '@/features/player/store/usePlayerStore';

/**
 * Stream URL Prefetch Hook
 * Arama sonuçlarında ilk 3 şarkı için stream URL'lerini arka planda alır
 * Böylece kullanıcı tıkladığında stream URL zaten hazır olur
 * 
 * NOT: Stream URL'ler geçici olabilir, bu yüzden sadece ilk 3 sonuç için prefetch yapıyoruz
 */
export function useStreamUrlPrefetch(results) {
  const prefetchedRef = useRef(new Set()); // Prefetch yapılan videoId'leri takip et
  const resultsRef = useRef(results); // Önceki results'ı takip et

  useEffect(() => {
    // Results değiştiyse, prefetched set'i temizle (yeni arama sonuçları için)
    if (resultsRef.current !== results) {
      prefetchedRef.current.clear();
      resultsRef.current = results;
    }

    if (!results || results.length === 0) {
      return;
    }

    // İlk 10 sonuç için prefetch yap (daha agresif prefetch)
    const topResults = results.slice(0, 10);

    // Her sonuç için stream URL prefetch yap
    topResults.forEach((track) => {
      // Zustand store'dan direkt oku (dependency olarak ekleme)
      const currentVideoIdCache = usePlayerStore.getState().videoIdCache;
      const currentStreamUrlCache = usePlayerStore.getState().streamUrlCache || {};

      // VideoId yoksa prefetch yapma
      const videoId = track.videoId || currentVideoIdCache[track.spotify_id];
      if (!videoId) {
        return;
      }

      // Eğer zaten prefetch yapıldıysa, tekrar yapma
      if (prefetchedRef.current.has(videoId)) {
        return;
      }

      // Eğer zaten cache'de varsa, prefetch yapma
      if (currentStreamUrlCache[videoId]) {
        prefetchedRef.current.add(videoId);
        return;
      }

      // Prefetch yapıldığını işaretle
      prefetchedRef.current.add(videoId);

      // Arka planda stream URL al (await kullanmıyoruz, fire-and-forget)
      (async () => {
        try {
          console.log('⚡ Prefetch: Stream URL alınıyor:', videoId);
          
          const { streamUrl } = await getStreamUrl(videoId);
          
          if (streamUrl) {
            // Cache'e kaydet (5 dakika geçerli olsun)
            usePlayerStore.setState((state) => ({
              streamUrlCache: {
                ...(state.streamUrlCache || {}),
                [videoId]: {
                  url: streamUrl,
                  timestamp: Date.now(),
                },
              },
            }));
            console.log('✅ Prefetch: Stream URL cache\'lendi:', videoId);
          }
        } catch (error) {
          // Prefetch hatalarını sessizce yok say (kullanıcıyı rahatsız etme)
          console.log('⚠️ Stream URL prefetch hatası (sessizce yok sayıldı):', videoId, error.message);
          // Hata durumunda prefetched set'ten çıkar, böylece tekrar deneyebilir
          prefetchedRef.current.delete(videoId);
        }
      })();
    });
  }, [results]); // Sadece results değiştiğinde çalış
}
