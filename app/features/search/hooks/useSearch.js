import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query/build/legacy/index';
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API URL'ini belirle
 * Production: Environment variable'dan alınır (cloud backend URL)
 * Development: app.json extra field veya environment variable
 * Fallback: Metro bundler host (fiziksel cihaz için)
 */
const getApiUrl = () => {
  // 1. Öncelik: Environment variable (production için)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. app.json extra field (development için)
  const apiUrlFromConfig = Constants.expoConfig?.extra?.apiUrl;
  if (apiUrlFromConfig) {
    return apiUrlFromConfig;
  }

  // 3. Development ortamında Metro bundler host kullan
  const isDev = __DEV__;
  if (isDev && Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri;
    const metroHost = hostUri ? hostUri.split(':')[0] : null;
    
    if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
      return `http://${metroHost}:3000`;
    }
    
    // Simülatör/emülatör için localhost
    return 'http://localhost:3000';
  }
  
  // 4. Production fallback (bu durumda environment variable zorunlu)
  console.warn('⚠️ API URL bulunamadı! Lütfen EXPO_PUBLIC_API_URL environment variable ayarlayın.');
  return null;
};

const API_BASE_URL = getApiUrl();

if (API_BASE_URL) {
  console.log('🌐 API Base URL:', API_BASE_URL);
} else {
  console.error('❌ API Base URL ayarlanmadı! Backend bağlantısı çalışmayacak.');
}

/**
 * Spotify arama hook'u
 * Debounce ile 500ms sonra arama yapar
 * Spotify'dan metadata alır (track_name, artist_name, album_art, spotify_id)
 */
export function useSearch(query) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce: Kullanıcı yazmayı bıraktıktan 500ms sonra aramayı tetikle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // TanStack Query ile arama yap
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        return { results: [], count: 0 };
      }

      if (!API_BASE_URL) {
        throw new Error('API URL yapılandırılmamış. Lütfen EXPO_PUBLIC_API_URL environment variable ayarlayın.');
      }

      console.log('🔍 Arama yapılıyor:', debouncedQuery.trim());
      console.log('🌐 API URL:', `${API_BASE_URL}/api/search`);
      
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: debouncedQuery.trim() },
        timeout: 30000, // 30 saniye timeout
      });

      console.log('✅ Arama sonucu:', response.data);
      
      // API'den gelen verileri doğrula ve filtrele
      // Sadece Spotify formatını kabul et (track_name, artist_name, album_art, spotify_id)
      // YouTube formatındaki verileri filtrele
      const spotifyResults = (response.data.results || []).filter((item) => {
        // Spotify formatında mı kontrol et
        const isSpotifyFormat = item.track_name && item.artist_name && item.spotify_id;
        
        // YouTube formatında mı kontrol et (title, artist, videoId varsa)
        const isYouTubeFormat = item.title && item.artist && item.videoId;
        
        // YouTube formatındaki verileri filtrele
        if (isYouTubeFormat) {
          console.warn('⚠️ YouTube formatında veri filtrelendi:', item);
          return false;
        }
        
        // Spotify formatındaki verileri kabul et
        if (isSpotifyFormat) {
          return true;
        }
        
        // Bilinmeyen formatları da filtrele
        console.warn('⚠️ Bilinmeyen format filtrelendi:', item);
        return false;
      }).map((item) => {
        // Spotify formatını normalize et
        return {
          spotify_id: item.spotify_id,
          track_name: item.track_name,
          artist_name: item.artist_name,
          album_art: item.album_art || null,
          album_name: item.album_name || null,
          duration: item.duration || '0:00',
          duration_ms: item.duration_ms || null,
          preview_url: item.preview_url || null,
        };
      });
      
      if (spotifyResults.length === 0 && (response.data.results || []).length > 0) {
        console.error('❌ API Spotify formatında veri döndürmedi! Backend kontrol edilmeli.');
      }
      
      return {
        ...response.data,
        results: spotifyResults,
        count: spotifyResults.length,
      };
    },
    enabled: Boolean(debouncedQuery && debouncedQuery.trim().length > 0), // Sadece query varsa çalıştır
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    retry: 2, // 2 kez tekrar dene
  });

  const results = data?.results || [];
  console.log('📊 useSearch döndürüyor:', { 
    resultsCount: results.length, 
    isLoading, 
    isError, 
    error: error?.message,
    firstResult: results[0] 
  });

  return {
    results,
    count: data?.count || 0,
    query: debouncedQuery,
    isLoading,
    isError,
    error,
    refetch,
  };
}


