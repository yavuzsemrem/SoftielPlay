import { useEffect, useRef } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import usePlayerStore from '@/features/player/store/usePlayerStore';

/**
 * API URL'ini belirle
 */
const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;
  if (apiUrlFromConfig) {
    return apiUrlFromConfig;
  }
  const isDev = __DEV__;
  if (isDev && Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    const metroHost = hostUri ? hostUri.split(':')[0] : null;
    if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
      return `http://${metroHost}:3000`;
    }
    return 'http://localhost:3000';
  }
  return null;
};

const API_BASE_URL = getApiUrl();

/**
 * VideoId Prefetch Hook
 * Arama sonuçlarında şarkıları kuyruğa alır ve sadece 2 paralel prefetch yapar
 * Böylece ana işlemi bloklamaz ve kullanıcı tıkladığında videoId hazır olur
 */
export function useVideoIdPrefetch(results) {
  const prefetchedRef = useRef(new Set()); // Prefetch yapılan spotify_id'leri takip et
  const resultsRef = useRef(results); // Önceki results'ı takip et
  const queueRef = useRef([]); // Prefetch kuyruğu
  const activePrefetchesRef = useRef(new Set()); // Aktif prefetch'ler
  const maxConcurrent = 2; // Aynı anda maksimum 2 prefetch

  useEffect(() => {
    // Results değiştiyse, prefetched set'i ve kuyruğu temizle
    if (resultsRef.current !== results) {
      prefetchedRef.current.clear();
      queueRef.current = [];
      activePrefetchesRef.current.clear();
      resultsRef.current = results;
    }

    if (!results || results.length === 0 || !API_BASE_URL) {
      return;
    }

    // İlk 15 sonuç için prefetch kuyruğuna ekle
    const topResults = results.slice(0, 15);
    
    topResults.forEach((track) => {
      // Eğer zaten prefetch yapıldıysa veya kuyruktaysa, tekrar ekleme
      if (prefetchedRef.current.has(track.spotify_id) || 
          activePrefetchesRef.current.has(track.spotify_id) ||
          queueRef.current.some(item => item.spotify_id === track.spotify_id)) {
        return;
      }

      // Cache kontrolü: Zustand store'dan direkt oku
      const currentCache = usePlayerStore.getState().videoIdCache;
      if (currentCache[track.spotify_id]) {
        prefetchedRef.current.add(track.spotify_id);
        return;
      }

      // Kuyruğa ekle
      queueRef.current.push({
        spotify_id: track.spotify_id,
        track: track
      });

      // Kuyruktan işle (eğer yer varsa)
      processPrefetchQueue();
    });

    // Kuyruk işleme fonksiyonu
    function processPrefetchQueue() {
      // Aktif prefetch sayısı max'a ulaştıysa bekle
      if (activePrefetchesRef.current.size >= maxConcurrent) {
        return;
      }

      // Kuyruk boşsa çık
      if (queueRef.current.length === 0) {
        return;
      }

      // Kuyruktan bir item al
      const item = queueRef.current.shift();
      if (!item) return;

      // Aktif prefetch'e ekle
      activePrefetchesRef.current.add(item.spotify_id);
      prefetchedRef.current.add(item.spotify_id);

      // Prefetch Promise'ini oluştur ve store'a kaydet
      const prefetchPromise = (async () => {
        try {
          console.log('⚡ Prefetch: YouTube video ID alınıyor:', track.spotify_id);
          
          const response = await axios.get(`${API_BASE_URL}/api/match-youtube/${track.spotify_id}`, {
            timeout: 30000, // 30 saniye (API yavaş olduğu için artırdık)
          });
          
          const videoId = response.data.youtube_match?.videoId;
          
          if (videoId) {
            // Cache'e kaydet
            usePlayerStore.setState((state) => ({
              videoIdCache: {
                ...state.videoIdCache,
                [track.spotify_id]: videoId,
              },
            }));
            console.log('✅ Prefetch: YouTube video ID cache\'lendi:', videoId);
            
            // VideoId alındıktan hemen sonra Stream URL'i de prefetch et
            // Bu sayede kullanıcı tıkladığında her şey hazır olur
            (async () => {
              try {
                const currentStreamCache = usePlayerStore.getState().streamUrlCache || {};
                if (currentStreamCache[videoId]) {
                  return; // Zaten cache'de var
                }
                
                console.log('⚡ Prefetch: Stream URL alınıyor (VideoId sonrası):', videoId);
                const { getStreamUrl } = await import('@/features/player/services/playerApi');
                const { streamUrl } = await getStreamUrl(videoId);
                
                if (streamUrl) {
                  usePlayerStore.setState((state) => ({
                    streamUrlCache: {
                      ...(state.streamUrlCache || {}),
                      [videoId]: {
                        url: streamUrl,
                        timestamp: Date.now(),
                      },
                    },
                  }));
                  console.log('✅ Prefetch: Stream URL cache\'lendi (VideoId sonrası):', videoId);
                }
              } catch (error) {
                console.log('⚠️ Stream URL prefetch hatası (VideoId sonrası):', videoId, error.message);
              }
            })();
            
            return videoId;
          }
        } catch (error) {
          // Prefetch hatalarını sessizce yok say (kullanıcıyı rahatsız etme)
          console.log('⚠️ Prefetch hatası (sessizce yok sayıldı):', track.spotify_id, error.message);
          // Hata durumunda prefetched set'ten çıkar, böylece tekrar deneyebilir
          prefetchedRef.current.delete(track.spotify_id);
          throw error;
        } finally {
          // Prefetch tamamlandı, promise'i store'dan temizle
          usePlayerStore.setState((state) => {
            const newPrefetchPromises = { ...(state.prefetchPromises || {}) };
            delete newPrefetchPromises[item.spotify_id];
            return { prefetchPromises: newPrefetchPromises };
          });

          // Aktif prefetch'ten çıkar
          activePrefetchesRef.current.delete(item.spotify_id);

          // Kuyruktan bir sonraki item'ı işle
          setTimeout(() => processPrefetchQueue(), 100); // 100ms delay ile kuyruğu işle
        }
      })();

      // Promise'i store'a kaydet (şarkı seçildiğinde beklenebilir)
      usePlayerStore.setState((state) => ({
        prefetchPromises: {
          ...(state.prefetchPromises || {}),
          [item.spotify_id]: prefetchPromise,
        },
      }));
    }

    // İlk kuyruk işlemeyi başlat
    processPrefetchQueue();
  }, [results]); // Sadece results değiştiğinde çalış
}
