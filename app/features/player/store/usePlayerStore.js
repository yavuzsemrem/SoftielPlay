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

  // Şarkı çalma fonksiyonu
  playTrack: async (track) => {
    try {
      const { sound: currentSound, stopTrack } = get();

      // Eğer aynı şarkı çalıyorsa, sadece devam ettir
      if (currentSound && get().currentTrack?.spotify_id === track.spotify_id) {
        await get().togglePlay();
        return;
      }

      // Önceki şarkıyı durdur
      if (currentSound) {
        await stopTrack();
      }

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
      
      if (!videoId && track.spotify_id) {
        console.log('🔍 YouTube video ID alınıyor:', track.spotify_id);
        
        if (!API_BASE_URL) {
          throw new Error('API URL yapılandırılmamış');
        }

        try {
          const response = await axios.get(`${API_BASE_URL}/api/match-youtube/${track.spotify_id}`, {
            timeout: 30000,
          });
          
          videoId = response.data.youtube_match?.videoId;
          
          if (!videoId) {
            throw new Error('YouTube video bulunamadı');
          }
          
          console.log('✅ YouTube video ID alındı:', videoId);
        } catch (error) {
          console.error('❌ YouTube video ID alma hatası:', error);
          throw new Error(error.response?.data?.message || 'YouTube video bulunamadı');
        }
      }

      if (!videoId) {
        throw new Error('Video ID bulunamadı');
      }

      // Backend'den stream URL al
      console.log('🎵 Stream URL alınıyor:', videoId);
      const { streamUrl } = await getStreamUrl(videoId);
      console.log('✅ Stream URL alındı:', streamUrl.substring(0, 50) + '...');

      // Audio modunu ayarla
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Yeni ses dosyasını yükle
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { 
          shouldPlay: true,
          isLooping: false,
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

      set({ 
        sound: newSound,
        isPlaying: true,
        isLoading: false,
      });

      console.log('✅ Şarkı çalmaya başladı:', track.track_name);

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
