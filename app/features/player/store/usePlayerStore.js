import { create } from 'zustand';
import { Audio } from 'expo-av';
import { getStreamUrl } from '../services/playerApi';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
 * Global Audio Player Store (Zustand)
 * Tüm uygulama genelinde müzik çalma durumunu yönetir
 */
const usePlayerStore = create((set, get) => ({
  // Durum
  currentTrack: null, // { spotify_id, track_name, artist_name, album_art, ... }
  isPlaying: false,
  sound: null, // expo-av Audio.Sound instance
  position: 0, // milisaniye cinsinden mevcut pozisyon
  duration: 0, // milisaniye cinsinden toplam süre
  isLoading: false,
  error: null,
  
  // Cache'ler (prefetch için)
  videoIdCache: {}, // spotify_id -> videoId mapping
  streamUrlCache: {}, // videoId -> { url, timestamp } mapping
  prefetchPromises: {}, // spotify_id -> Promise mapping (devam eden prefetch'leri takip et)

  // Şarkı çalma fonksiyonu
  playTrack: async (track) => {
    const totalStartTime = Date.now(); // Toplam başlangıç zamanı
    
    try {
      const { sound: currentSound, stopTrack } = get();

      // Eğer aynı şarkı çalıyorsa, sadece devam ettir
      if (currentSound && get().currentTrack?.spotify_id === track.spotify_id) {
        await get().togglePlay();
        return;
      }

      // Önceki şarkıyı durdur (paralel olarak yapılabilir ama güvenlik için await ediyoruz)
      if (currentSound) {
        await stopTrack();
      }

      // Optimistic UI: Hemen UI'ı güncelle (kullanıcı tıklamayı görsün)
      set({ 
        isLoading: true, 
        error: null,
        currentTrack: track,
        isPlaying: false,
        position: 0,
        duration: 0,
      });

      // Eğer videoId yoksa, Spotify ID'den videoId al
      let videoId = track.videoId;
      let videoIdTime = 0;
      let videoIdFromCache = false;
      
      // Cache kontrolü (çok hızlı, önce bunu yap)
      const currentCache = get().videoIdCache;
      const prefetchPromises = get().prefetchPromises || {};
      
      if (!videoId && track.spotify_id && currentCache[track.spotify_id]) {
        videoId = currentCache[track.spotify_id];
        videoIdFromCache = true;
        console.log(`⚡ VideoId cache'den alındı (0ms):`, videoId);
      } else if (!videoId && track.spotify_id) {
        // Prefetch devam ediyor mu kontrol et
        const prefetchPromise = prefetchPromises[track.spotify_id];
        if (prefetchPromise) {
          console.log('⏳ Prefetch devam ediyor, bekleniyor...');
          const videoIdStartTime = Date.now();
          try {
            // Prefetch'in tamamlanmasını bekle (max 5 saniye - API yavaş olduğu için)
            // Eğer prefetch 5 saniye içinde tamamlanmazsa, normal API çağrısı yap
            const prefetchResult = await Promise.race([
              prefetchPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Prefetch timeout')), 5000))
            ]);
            
            // Prefetch tamamlandı, cache'den kontrol et
            const updatedCache = get().videoIdCache;
            if (updatedCache[track.spotify_id]) {
              videoId = updatedCache[track.spotify_id];
              videoIdFromCache = true;
              videoIdTime = Date.now() - videoIdStartTime;
              console.log(`⚡ VideoId prefetch'ten alındı (${videoIdTime}ms):`, videoId);
            } else {
              throw new Error('Prefetch tamamlandı ama videoId bulunamadı');
            }
          } catch (error) {
            // Prefetch timeout oldu veya başarısız, normal API çağrısı yap
            console.log('⚠️ Prefetch timeout/hatası, normal API çağrısı yapılıyor');
            const videoIdStartTime = Date.now();
            
            if (!API_BASE_URL) {
              throw new Error('API URL yapılandırılmamış');
            }

            const response = await axios.get(`${API_BASE_URL}/api/match-youtube/${track.spotify_id}`, {
              timeout: 30000,
            });
            
            videoId = response.data.youtube_match?.videoId;
            videoIdTime = Date.now() - videoIdStartTime;
            
            if (!videoId) {
              throw new Error('YouTube video bulunamadı');
            }
            
            // Cache'e kaydet
            set((state) => ({
              videoIdCache: {
                ...state.videoIdCache,
                [track.spotify_id]: videoId,
              },
            }));
            
            console.log(`✅ YouTube video ID alındı (${videoIdTime}ms):`, videoId);
          } finally {
            // Prefetch promise'ini temizle
            set((state) => {
              const newPrefetchPromises = { ...state.prefetchPromises };
              delete newPrefetchPromises[track.spotify_id];
              return { prefetchPromises: newPrefetchPromises };
            });
          }
        } else {
          // Prefetch yok, normal API çağrısı yap
          const videoIdStartTime = Date.now();
          console.log('🔍 YouTube video ID alınıyor:', track.spotify_id);
          
          if (!API_BASE_URL) {
            throw new Error('API URL yapılandırılmamış');
          }

          try {
            const response = await axios.get(`${API_BASE_URL}/api/match-youtube/${track.spotify_id}`, {
              timeout: 30000,
            });
            
            videoId = response.data.youtube_match?.videoId;
            videoIdTime = Date.now() - videoIdStartTime;
            
            if (!videoId) {
              throw new Error('YouTube video bulunamadı');
            }
            
            // Cache'e kaydet
            set((state) => ({
              videoIdCache: {
                ...state.videoIdCache,
                [track.spotify_id]: videoId,
              },
            }));
            
            console.log(`✅ YouTube video ID alındı (${videoIdTime}ms):`, videoId);
          } catch (error) {
            console.error('❌ YouTube video ID alma hatası:', error);
            throw new Error(error.response?.data?.message || 'YouTube video bulunamadı');
          }
        }
      } else if (videoId) {
        videoIdFromCache = true; // Zaten track'te var
        console.log('✅ VideoId track\'te mevcut:', videoId);
      }

      if (!videoId) {
        throw new Error('Video ID bulunamadı');
      }

      // Backend'den stream URL al
      const streamUrlStartTime = Date.now();
      
      // Önce cache'den kontrol et (çok hızlı)
      const currentStreamCache = get().streamUrlCache;
      let streamUrl;
      let streamUrlTime = 0;
      let streamUrlFromCache = false;
      
      if (currentStreamCache[videoId] && currentStreamCache[videoId].url) {
        const cached = currentStreamCache[videoId];
        const cacheAge = Date.now() - cached.timestamp;
        // Cache 2 saatten eski değilse kullan (backend cache TTL ile uyumlu)
        if (cacheAge < 2 * 60 * 60 * 1000) {
          streamUrl = cached.url;
          streamUrlTime = Date.now() - streamUrlStartTime;
          streamUrlFromCache = true;
          console.log(`⚡ Stream URL cache'den alındı (${streamUrlTime}ms, ${Math.round(cacheAge / 1000)}s önce cache'lendi)`);
        }
      }
      
      if (!streamUrl) {
        console.log('🎵 Stream URL alınıyor:', videoId);
        const { streamUrl: fetchedStreamUrl } = await getStreamUrl(videoId);
        streamUrl = fetchedStreamUrl;
        streamUrlTime = Date.now() - streamUrlStartTime;
        
        // Cache'e kaydet
        set((state) => ({
          streamUrlCache: {
            ...(state.streamUrlCache || {}),
            [videoId]: {
              url: streamUrl,
              timestamp: Date.now(),
            },
          },
        }));
        
        console.log(`✅ Stream URL alındı (${streamUrlTime}ms):`, streamUrl.substring(0, 50) + '...');
      }

      // Audio modunu ayarla
      const audioModeStartTime = Date.now();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      const audioModeTime = Date.now() - audioModeStartTime;

      // Yeni ses dosyasını yükle (progressive loading)
      const audioLoadStartTime = Date.now();
      
      // Ses dosyasını yükle ve hemen çalmaya başla (optimize edilmiş ayarlar)
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { 
          shouldPlay: true, // Hemen çalmaya başla
          isLooping: false,
          progressUpdateIntervalMillis: 250, // Daha sık güncelleme
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
          // iOS optimizasyonları
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          // Android optimizasyonları
          shouldDuckAndroid: true,
        },
        (status) => {
          // Status güncellemeleri
          if (status.isLoaded) {
            set({ 
              position: status.positionMillis || 0,
              duration: status.durationMillis || 0,
              isPlaying: status.isPlaying || false,
            });

            // Şarkı bittiğinde
            if (status.didJustFinish) {
              set({ isPlaying: false, position: 0 });
            }
          }
        }
      );
      const audioLoadTime = Date.now() - audioLoadStartTime;

      set({ 
        sound: newSound,
        isPlaying: true,
        isLoading: false,
      });

      const totalTime = Date.now() - totalStartTime;
      
      // Detaylı timing logları
      console.log('═══════════════════════════════════════════════════════');
      console.log(`⏱️  ŞARKI AÇILMA SÜRELERİ: ${track.track_name}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📹 VideoId alma:     ${videoIdTime}ms ${videoIdFromCache ? '(CACHE)' : '(API)'}`);
      console.log(`🔗 Stream URL alma:  ${streamUrlTime}ms ${streamUrlFromCache ? '(CACHE)' : '(API)'}`);
      console.log(`🎛️  Audio mode:       ${audioModeTime}ms`);
      console.log(`🎵 Audio yükleme:    ${audioLoadTime}ms`);
      console.log('───────────────────────────────────────────────────────');
      console.log(`✅ TOPLAM SÜRE:      ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
      console.log('═══════════════════════════════════════════════════════');

    } catch (error) {
      console.error('❌ Şarkı çalma hatası:', error);
      set({ 
        error: error.message || 'Şarkı çalınamadı',
        isLoading: false,
        isPlaying: false,
      });
    }
  },

  // Oynat/Durdur toggle
  togglePlay: async () => {
    const { sound, isPlaying } = get();
    
    if (!sound) {
      console.warn('⚠️ Çalınacak şarkı yok');
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('❌ Oynat/Durdur hatası:', error);
      set({ error: error.message });
    }
  },

  // Pozisyon değiştirme (seek)
  seek: async (position) => {
    const { sound } = get();
    
    if (!sound) {
      return;
    }

    try {
      await sound.setPositionAsync(position);
      set({ position });
    } catch (error) {
      console.error('❌ Seek hatası:', error);
    }
  },

  // Şarkıyı durdur ve temizle
  stopTrack: async () => {
    const { sound } = get();
    
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('❌ Ses dosyası kaldırma hatası:', error);
      }
    }

    set({
      sound: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      currentTrack: null,
      error: null,
    });
  },

  // Store'u sıfırla
  reset: () => {
    get().stopTrack();
    set({
      currentTrack: null,
      isPlaying: false,
      sound: null,
      position: 0,
      duration: 0,
      isLoading: false,
      error: null,
    });
  },
}));

export default usePlayerStore;



