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
  console.log('🌐 Player API Base URL:', API_BASE_URL);
} else {
  console.error('❌ Player API Base URL ayarlanmadı! Backend bağlantısı çalışmayacak.');
}

/**
 * YouTube video ID'sini oynatılabilir ses URL'sine dönüştürür
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<{success: boolean, videoId: string, streamUrl: string}>}
 */
export async function getStreamUrl(videoId) {
  if (!videoId || videoId.trim().length === 0) {
    throw new Error('Video ID gerekli');
  }

  if (!API_BASE_URL) {
    throw new Error('API URL yapılandırılmamış. Lütfen EXPO_PUBLIC_API_URL environment variable ayarlayın.');
  }

  try {
    console.log('🎵 Stream URL alınıyor:', videoId);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/stream/${videoId}`);
    
    const response = await axios.get(`${API_BASE_URL}/api/stream/${videoId}`, {
      timeout: 30000, // 30 saniye timeout
    });

    console.log('✅ Stream URL alındı:', response.data.streamUrl?.substring(0, 50) + '...');
    
    return response.data;
  } catch (error) {
    // Axios hata yanıtı
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 404) {
        throw new Error(errorData.message || 'Video bulunamadı veya kısıtlı');
      }

      if (status === 500) {
        throw new Error(errorData.message || 'Stream URL alınamadı');
      }

      throw new Error(errorData.message || `API hatası: ${status}`);
    }

    // Network hatası
    if (error.request) {
      throw new Error('Backend\'e bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
    }

    // Diğer hatalar
    throw new Error(error.message || 'Bilinmeyen hata oluştu');
  }
}
