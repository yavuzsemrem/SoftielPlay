/**
 * YouTube video URL extractor - alternatif yöntem
 * YouTube'un yeni yapısında URL'leri çıkarmak için
 */

import axios from 'axios';

class YouTubeExtractor {
  /**
   * YouTube video ID'den direkt audio URL'i al
   * Bu yöntem YouTube'un watch sayfasını kullanarak URL'leri çıkarır
   */
  async getAudioUrl(videoId: string): Promise<string> {
    try {
      // YouTube'un watch sayfasını al
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await axios.get(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.youtube.com/',
        },
        timeout: 20000,
      });

      const html = response.data;
      
      // Player config'i bul - birden fazla pattern dene
      let config: any = null;
      
      // Pattern 1: var ytInitialPlayerResponse = {...};
      const configMatch1 = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s);
      if (configMatch1) {
        try {
          config = JSON.parse(configMatch1[1]);
        } catch (e) {
          // Devam et
        }
      }
      
      // Pattern 2: window["ytInitialPlayerResponse"] = {...};
      if (!config) {
        const configMatch2 = html.match(/window\["ytInitialPlayerResponse"\]\s*=\s*({.+?});/s);
        if (configMatch2) {
          try {
            config = JSON.parse(configMatch2[1]);
          } catch (e) {
            // Devam et
          }
        }
      }
      
      // Pattern 3: ytInitialPlayerResponse içeren script tag (daha geniş arama)
      if (!config) {
        const scriptMatches = html.matchAll(/<script[^>]*>(.*?ytInitialPlayerResponse.*?)<\/script>/gs);
        for (const match of scriptMatches) {
          const scriptContent = match[1];
          const jsonMatch = scriptContent.match(/ytInitialPlayerResponse\s*=\s*({.+?});/s);
          if (jsonMatch) {
            try {
              config = JSON.parse(jsonMatch[1]);
              break;
            } catch (e) {
              // Devam et
            }
          }
        }
      }
      
      if (!config || !config.streamingData) {
        throw new Error('Player config bulunamadı');
      }
      
      const streamingData = config.streamingData;
      
      // Tüm formatları birleştir
      const allFormats = [
        ...(streamingData.adaptiveFormats || []),
        ...(streamingData.formats || []),
      ];
      
      // Audio formatlarını bul - sadece gerçek audio formatları
      const audioFormats = allFormats.filter((f: any) => {
        const mimeType = (f.mimeType || '').toLowerCase();
        // Video içeren formatları hariç tut
        if (mimeType.includes('video')) {
          return false;
        }
        return mimeType.includes('audio') || 
               mimeType.includes('m4a') || 
               (mimeType.includes('webm') && mimeType.includes('audio')) ||
               mimeType.includes('opus') ||
               mimeType.includes('aac');
      });
      
      if (audioFormats.length === 0) {
        throw new Error('Audio format bulunamadı');
      }
      
      // En yüksek kaliteli audio'yu seç
      const best = audioFormats.sort((a: any, b: any) => {
        // Önce itag'a göre
        if (b.itag !== a.itag) {
          return b.itag - a.itag;
        }
        // Sonra bitrate'e göre
        const aBitrate = parseInt(a.bitrate || '0');
        const bBitrate = parseInt(b.bitrate || '0');
        return bBitrate - aBitrate;
      })[0];
      
      // URL varsa direkt kullan
      if (best.url && best.url.startsWith('http')) {
        console.log('Found direct URL from watch page');
        return best.url;
      }
      
      // signatureCipher varsa decode et
      if (best.signatureCipher || best.cipher) {
        const decoded = this.decodeSignatureCipher(best.signatureCipher || best.cipher);
        if (decoded && decoded.startsWith('http')) {
          console.log('Decoded URL from watch page');
          return decoded;
        }
      }
      
      // Eğer initRange ve indexRange varsa, URL oluşturmayı dene
      if (best.initRange && best.indexRange) {
        console.log('Format has initRange/indexRange, trying to construct URL');
        // Innertube service'den URL oluşturma fonksiyonunu kullan
        const {innertubeService} = await import('./innertube');
        const constructedUrl = await innertubeService.constructUrlFromFormat(best, videoId, streamingData);
        if (constructedUrl && constructedUrl.startsWith('http')) {
          console.log('Successfully constructed URL from format data');
          return constructedUrl;
        }
      }
      
      throw new Error('Watch sayfasından URL çıkarılamadı - format bilgileri mevcut ama URL yok');
    } catch (error: any) {
      console.error('YouTube extractor error:', error.message);
      throw error;
    }
  }

  private decodeSignatureCipher(cipher: string): string {
    try {
      let decoded = decodeURIComponent(cipher);
      const urlMatch = decoded.match(/url=([^&]+)/);
      if (urlMatch) {
        const baseUrl = decodeURIComponent(urlMatch[1]);
        const sigMatch = decoded.match(/s=([^&]+)/);
        if (sigMatch) {
          const signature = decodeURIComponent(sigMatch[1]);
          const separator = baseUrl.includes('?') ? '&' : '?';
          return `${baseUrl}${separator}sig=${signature}`;
        }
        if (baseUrl.startsWith('http')) {
          return baseUrl;
        }
      }
      if (decoded.startsWith('http')) {
        return decoded;
      }
      return cipher;
    } catch (error) {
      return cipher;
    }
  }
}

export const youtubeExtractor = new YouTubeExtractor();

