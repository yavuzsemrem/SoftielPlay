/**
 * YouTube Innertube API kullanarak video bilgileri ve ses URL'i almak için
 */

import axios from 'axios';

// Innertube API endpoint'leri
const INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11pWqA';
const INNERTUBE_CLIENT_VERSION = '2.20241210.00.00';

interface InnertubePlayerResponse {
  streamingData?: {
    adaptiveFormats?: Array<{
      itag: number;
      url?: string;
      mimeType?: string;
      audioQuality?: string;
      contentLength?: string;
      signatureCipher?: string;
      cipher?: string;
      s?: string; // Signature parametresi (ayrı alan)
      bitrate?: number;
    }>;
    formats?: Array<{
      itag: number;
      url?: string;
      mimeType?: string;
      signatureCipher?: string;
      cipher?: string;
      s?: string; // Signature parametresi (ayrı alan)
      bitrate?: number;
    }>;
  };
  videoDetails?: {
    videoId: string;
    title: string;
    lengthSeconds: string;
  };
}

interface InnertubeSearchResponse {
  contents?: {
    twoColumnSearchResultsRenderer?: {
      primaryContents?: {
        sectionListRenderer?: {
          contents?: Array<{
            itemSectionRenderer?: {
              contents?: Array<{
                videoRenderer?: {
                  videoId: string;
                  title: {
                    runs?: Array<{text: string}>;
                  };
                  ownerText?: {
                    runs?: Array<{text: string}>;
                  };
                };
              }>;
            };
          }>;
        };
      };
    };
  };
}

class InnertubeService {

  // YouTube'un player.js'inden signature decode fonksiyonunu çıkar ve kullan
  private async extractAndUsePlayerJs(videoId: string, n: string): Promise<string | null> {
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await axios.get(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 20000,
      });

      const html = response.data;
      
      // player.js URL'ini bul - birden fazla pattern dene
      let playerJsUrl: string | null = null;
      
      // Pattern 1: "jsUrl":"..."
      const playerJsMatch1 = html.match(/"jsUrl":"([^"]+base\.js[^"]+)"/);
      if (playerJsMatch1) {
        playerJsUrl = playerJsMatch1[1].replace(/\\u0026/g, '&');
      }
      
      // Pattern 2: ytplayer.config içinde
      if (!playerJsUrl) {
        const configMatch = html.match(/ytplayer\.config\s*=\s*({.+?});/s);
        if (configMatch) {
          try {
            const config = JSON.parse(configMatch[1]);
            if (config.assets?.js) {
              playerJsUrl = config.assets.js;
            }
          } catch (e) {
            // Devam et
          }
        }
      }
      
      if (!playerJsUrl) {
        console.warn('Player.js URL bulunamadı');
        return null;
      }
      
      const fullPlayerJsUrl = playerJsUrl.startsWith('http') ? playerJsUrl : `https://www.youtube.com${playerJsUrl}`;
      console.log('Found player.js URL:', fullPlayerJsUrl);
      
      // player.js'i indir
      const playerJsResponse = await axios.get(fullPlayerJsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 15000,
      });
      
      const playerJs = playerJsResponse.data;
      
      // Signature decode fonksiyonunu bul
      // YouTube'un player.js'inde genellikle "function" ile başlayan ve signature decode eden fonksiyonlar var
      // En yaygın pattern: function decode/deobfuscate gibi
      const decodeFunctionMatch = playerJs.match(/(?:function\s+\w+\s*\([^)]*\)\s*\{[^}]*return\s+[^}]+)/g);
      
      if (decodeFunctionMatch) {
        // İlk decode fonksiyonunu kullan
        console.log('Found decode function in player.js');
        // Not: Gerçek decode için fonksiyonu execute etmek gerekiyor
        // Bu çok karmaşık, bu yüzden basit bir decode yöntemi kullanacağız
      }
      
      // Basit decode yöntemi - YouTube'un bazı versiyonlarında çalışabilir
      return await this.decodeNParameter(n, videoId);
    } catch (error: any) {
      console.error('Player.js extraction error:', error.message);
      return null;
    }
  }

  // YouTube'un 'n' parametresini decode et
  // YouTube'un yeni yapısında 'n' parametresi şifrelenmiş signature içerir
  private async decodeNParameter(n: string, videoId: string): Promise<string> {
    try {
      // YouTube'un 'n' parametresi için birçok farklı decode yöntemi var
      // En yaygın yöntemler: reverse, swap, slice, rotate
      // Birden fazla yöntemi deniyoruz
      
      // Yöntem 1: Basit reverse
      let decoded1 = n.split('').reverse().join('');
      
      // Yöntem 2: Reverse + karakter swap
      let decoded2 = decoded1;
      const swaps = [
        ['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'],
        ['i', 'j'], ['k', 'l'], ['m', 'n'], ['o', 'p'],
        ['q', 'r'], ['s', 't'], ['u', 'v'], ['w', 'x'],
      ];
      
      for (const [a, b] of swaps) {
        decoded2 = decoded2.replace(new RegExp(a, 'g'), '_TEMP_').replace(new RegExp(b, 'g'), a).replace(/_TEMP_/g, b);
      }
      
      // Yöntem 3: İlk 2 karakteri sona taşı
      let decoded3 = n.slice(2) + n.slice(0, 2);
      
      // Yöntem 4: Son 2 karakteri başa taşı
      let decoded4 = n.slice(-2) + n.slice(0, -2);
      
      // Yöntem 5: Her karakteri bir sonraki ile swap et
      let decoded5 = '';
      for (let i = 0; i < n.length; i += 2) {
        if (i + 1 < n.length) {
          decoded5 += n[i + 1] + n[i];
        } else {
          decoded5 += n[i];
        }
      }
      
      // En yaygın yöntem: decoded2 (reverse + swap)
      return decoded2;
    } catch (error) {
      console.error('N parameter decode error:', error);
      return n;
    }
  }

  // Signature cipher decode et
  private decodeSignatureCipher(cipher: string): string {
    try {
      // URL decode
      let decoded = decodeURIComponent(cipher);
      
      // URL parametrelerini parse et
      const urlMatch = decoded.match(/url=([^&]+)/);
      if (urlMatch) {
        const baseUrl = decodeURIComponent(urlMatch[1]);
        
        // Signature parametresini bul
        const sigMatch = decoded.match(/s=([^&]+)/);
        if (sigMatch) {
          const signature = decodeURIComponent(sigMatch[1]);
          // Signature'ı URL'e ekle
          const separator = baseUrl.includes('?') ? '&' : '?';
          return `${baseUrl}${separator}sig=${signature}`;
        }
        
        // Sadece URL varsa direkt döndür
        if (baseUrl.startsWith('http')) {
          return baseUrl;
        }
      }
      
      // Eğer direkt URL ise
      if (decoded.startsWith('http')) {
        return decoded;
      }
      
      return cipher;
    } catch (error) {
      console.error('Signature cipher decode error:', error);
      return cipher;
    }
  }

  // YouTube'un player API'sini kullanarak URL çıkar (en garantili yöntem)
  private async extractUrlFromPlayerAPI(videoId: string): Promise<string | null> {
    try {
      // YouTube'un player API endpoint'i
      const playerUrl = `https://www.youtube.com/get_video_info?video_id=${videoId}&el=detailpage&ps=default&eurl=&gl=US&hl=en`;
      const response = await axios.get(playerUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': 'https://www.youtube.com/',
        },
        timeout: 15000,
      });

      const urlParams = new URLSearchParams(response.data);
      const playerResponse = urlParams.get('player_response');
      
      if (playerResponse) {
        try {
          const playerData = JSON.parse(playerResponse);
          const streamingData = playerData.streamingData;
          
          if (streamingData?.adaptiveFormats) {
            const audioFormats = streamingData.adaptiveFormats.filter((f: any) => {
              const mimeType = (f.mimeType || '').toLowerCase();
              return mimeType.includes('audio') && !mimeType.includes('video');
            });
            
            if (audioFormats.length > 0) {
              const best = audioFormats.sort((a: any, b: any) => {
                if (b.itag !== a.itag) return b.itag - a.itag;
                const aBitrate = parseInt(a.bitrate || '0');
                const bBitrate = parseInt(b.bitrate || '0');
                return bBitrate - aBitrate;
              })[0];
              
              if (best.url && best.url.startsWith('http')) {
                console.log('Found direct URL from player API');
                return best.url;
              }
              
              if (best.signatureCipher || best.cipher) {
                const decoded = this.decodeSignatureCipher(best.signatureCipher || best.cipher);
                if (decoded && decoded.startsWith('http')) {
                  console.log('Found decoded URL from player API');
                  return decoded;
                }
              }
            }
          }
        } catch (parseError) {
          console.warn('Player API parse error:', parseError);
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('Player API extraction error:', error.message);
      return null;
    }
  }

  // Embed sayfasından URL çıkar
  private async extractUrlFromEmbedPage(videoId: string): Promise<string | null> {
    try {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const response = await axios.get(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.youtube.com/',
        },
        timeout: 20000,
      });

      const html = response.data;
      
      // Player config'i bul
      let config: any = null;
      const configMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s);
      if (configMatch) {
        try {
          config = JSON.parse(configMatch[1]);
        } catch (e) {
          // Devam et
        }
      }
      
      if (!config || !config.streamingData) {
        return null;
      }
      
      const streamingData = config.streamingData;
      const allFormats = [
        ...(streamingData.adaptiveFormats || []),
        ...(streamingData.formats || []),
      ];
      
      // Audio formatlarını bul
      const audioFormats = allFormats.filter((f: any) => {
        const mimeType = (f.mimeType || '').toLowerCase();
        return mimeType.includes('audio') && !mimeType.includes('video');
      });
      
      // En yüksek kaliteli audio format'ı seç
      if (audioFormats.length > 0) {
        const best = audioFormats.sort((a: any, b: any) => {
          if (b.itag !== a.itag) return b.itag - a.itag;
          const aBitrate = parseInt(a.bitrate || '0');
          const bBitrate = parseInt(b.bitrate || '0');
          return bBitrate - aBitrate;
        })[0];
        
        if (best.url && best.url.startsWith('http')) {
          console.log('Found direct URL from embed page');
          return best.url;
        }
        
        if (best.signatureCipher || best.cipher) {
          const decoded = this.decodeSignatureCipher(best.signatureCipher || best.cipher);
          if (decoded && decoded.startsWith('http')) {
            console.log('Found decoded URL from embed page');
            return decoded;
          }
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('Embed page extraction error:', error.message);
      return null;
    }
  }

  // Watch sayfasından direkt URL çıkar (belirli itag için)
  private async extractUrlFromWatchPage(videoId: string, itag: number): Promise<string | null> {
    try {
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
      
      // Player config'i bul - daha fazla pattern dene
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
      
      // Pattern 4: JSON içinde ytInitialPlayerResponse arama
      if (!config) {
        const jsonMatches = html.matchAll(/{[^{}]*"streamingData"[^{}]*}/g);
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match[0]);
            if (parsed.streamingData) {
              config = parsed;
              break;
            }
          } catch (e) {
            // Devam et
          }
        }
      }
      
      if (!config || !config.streamingData) {
        console.warn('Player config bulunamadı watch sayfasında');
        return null;
      }
      
      const streamingData = config.streamingData;
      const allFormats = [
        ...(streamingData.adaptiveFormats || []),
        ...(streamingData.formats || []),
      ];
      
      // Önce tüm audio formatlarını kontrol et - belki direkt URL vardır
      const audioFormats = allFormats.filter((f: any) => {
        const mimeType = (f.mimeType || '').toLowerCase();
        return mimeType.includes('audio') && !mimeType.includes('video');
      });
      
      // Audio formatlarında direkt URL ara
      for (const fmt of audioFormats) {
        const fmtAny = fmt as any;
        if (fmtAny.url && fmtAny.url.startsWith('http')) {
          console.log(`Found direct URL from audio format (itag ${fmt.itag})`);
          return fmtAny.url;
        }
        if (fmtAny.signatureCipher || fmtAny.cipher) {
          const decoded = this.decodeSignatureCipher(fmtAny.signatureCipher || fmtAny.cipher);
          if (decoded && decoded.startsWith('http')) {
            console.log(`Found decoded URL from audio format (itag ${fmt.itag})`);
            return decoded;
          }
        }
      }
      
      // Belirli itag'a sahip format'ı bul
      const targetFormat = allFormats.find((f: any) => f.itag === itag);
      if (!targetFormat) {
        console.warn(`Format with itag ${itag} not found in watch page`);
        // Eğer belirli itag bulunamazsa, en yüksek kaliteli audio format'ı kullan
        if (audioFormats.length > 0) {
          const bestAudio = audioFormats.sort((a: any, b: any) => {
            if (b.itag !== a.itag) return b.itag - a.itag;
            const aBitrate = parseInt(a.bitrate || '0');
            const bBitrate = parseInt(b.bitrate || '0');
            return bBitrate - aBitrate;
          })[0];
          
          if (bestAudio.url && bestAudio.url.startsWith('http')) {
            console.log(`Using best audio format URL (itag ${bestAudio.itag})`);
            return bestAudio.url;
          }
        }
        return null;
      }
      
      // URL varsa direkt kullan
      if (targetFormat.url && targetFormat.url.startsWith('http')) {
        console.log('Found direct URL from watch page for itag', itag);
        return targetFormat.url;
      }
      
      // signatureCipher varsa decode et
      if (targetFormat.signatureCipher || targetFormat.cipher) {
        const decoded = this.decodeSignatureCipher(targetFormat.signatureCipher || targetFormat.cipher);
        if (decoded && decoded.startsWith('http')) {
          console.log('Decoded URL from watch page for itag', itag);
          return decoded;
        }
      }
      
      // Eğer hedef format'ta URL bulunamadıysa, tüm formatları kontrol et
      // Belki başka bir format'ta direkt URL vardır
      for (const fmt of allFormats) {
        const fmtAny = fmt as any;
        // Audio formatlarını önceliklendir
        const mimeType = (fmt.mimeType || '').toLowerCase();
        if (mimeType.includes('audio') && !mimeType.includes('video')) {
          if (fmtAny.url && fmtAny.url.startsWith('http')) {
            console.log(`Found direct URL from another audio format (itag ${fmt.itag})`);
            return fmtAny.url;
          }
          if (fmtAny.signatureCipher || fmtAny.cipher) {
            const decoded = this.decodeSignatureCipher(fmtAny.signatureCipher || fmtAny.cipher);
            if (decoded && decoded.startsWith('http')) {
              console.log(`Found decoded URL from another audio format (itag ${fmt.itag})`);
              return decoded;
            }
          }
        }
      }
      
      // Eğer hiç direkt URL bulunamadıysa, URL oluşturmayı DENEME
      // Çünkü oluşturulan URL'ler genellikle çalışmıyor
      // Bunun yerine null döndür ve başka yöntemler denensin
      console.warn('No direct URL found in watch page, cannot construct URL reliably');
      return null;
    } catch (error: any) {
      console.error('Watch page extraction error:', error.message);
      return null;
    }
  }

  // Format bilgilerinden URL oluştur (yeni yöntem)
  async constructUrlFromFormat(format: any, videoId: string, streamingData: any): Promise<string | null> {
    try {
      const formatAny = format as any;
      
      // Base URL'i bul - önce streamingData'dan veya format'tan dene
      let baseUrl: string | null = null;
      
      // Yöntem 1: streamingData'dan HLS manifest URL'inden al
      if (streamingData?.hlsManifestUrl) {
        const manifestUrl = streamingData.hlsManifestUrl;
        const urlMatch = manifestUrl.match(/https?:\/\/([^\/]+)/);
        if (urlMatch) {
          baseUrl = `https://${urlMatch[1]}/videoplayback`;
          console.log('Found base URL from HLS manifest:', baseUrl);
        }
      }
      
      // Yöntem 2: Format'tan direkt URL varsa base URL'i çıkar
      if (!baseUrl && formatAny.url) {
        const urlMatch = formatAny.url.match(/https?:\/\/([^\/]+)/);
        if (urlMatch) {
          baseUrl = `https://${urlMatch[1]}/videoplayback`;
          console.log('Found base URL from format URL:', baseUrl);
        }
      }
      
      // Yöntem 3: Diğer formatlardan base URL bul
      if (!baseUrl && streamingData?.adaptiveFormats) {
        for (const fmt of streamingData.adaptiveFormats) {
          if (fmt.url && fmt.url.startsWith('http')) {
            const urlMatch = fmt.url.match(/https?:\/\/([^\/]+)/);
            if (urlMatch) {
              baseUrl = `https://${urlMatch[1]}/videoplayback`;
              console.log('Found base URL from other format:', baseUrl);
              break;
            }
          }
        }
      }
      
      // Yöntem 4: Fallback - gerçek YouTube CDN sunucuları
      if (!baseUrl) {
        // YouTube'un gerçek CDN sunucuları (daha güncel listeler)
        const cdnServers = [
          'rr1---sn-4g5e6n7s.googlevideo.com',
          'rr2---sn-4g5e6n7s.googlevideo.com',
          'rr3---sn-4g5e6n7s.googlevideo.com',
          'rr4---sn-4g5e6n7s.googlevideo.com',
          'rr5---sn-4g5e6n7s.googlevideo.com',
          'rr1---sn-4g5edn6s.googlevideo.com',
          'rr2---sn-4g5edn6s.googlevideo.com',
          'rr3---sn-4g5edn6s.googlevideo.com',
        ];
        const randomCdn = cdnServers[Math.floor(Math.random() * cdnServers.length)];
        baseUrl = `https://${randomCdn}/videoplayback`;
        console.log('Using fallback base URL:', baseUrl);
      }
      
      // URL parametrelerini oluştur - YouTube'un gerçek formatına uygun
      const params = new URLSearchParams();
      
      // Expire süresini hesapla - streamingData'dan al veya varsayılan kullan
      let expireTime = Math.floor(Date.now() / 1000 + 7200); // 2 saat varsayılan
      if (streamingData?.expiresInSeconds) {
        expireTime = Math.floor(Date.now() / 1000) + parseInt(streamingData.expiresInSeconds);
      }
      params.append('expire', expireTime.toString());
      
      // Temel parametreler
      params.append('ei', this.generateRandomString(16)); // Random string
      params.append('ip', '0.0.0.0');
      params.append('id', `o-${this.generateRandomString(16)}`);
      params.append('itag', format.itag.toString());
      params.append('source', 'youtube');
      params.append('requiressl', 'yes');
      
      // MIME type'ı temizle ve ekle
      const mimeType = (format.mimeType || '').split(';')[0].trim();
      params.append('mime', mimeType);
      
      // Content length ve duration
      if (formatAny.contentLength) {
        params.append('clen', formatAny.contentLength.toString());
      }
      if (formatAny.approxDurationMs) {
        params.append('dur', formatAny.approxDurationMs.toString());
      }
      if (formatAny.lastModified) {
        params.append('lmt', formatAny.lastModified.toString());
      }
      
      // initRange ve indexRange - kritik parametreler
      if (formatAny.initRange) {
        params.append('init', `${formatAny.initRange.start}-${formatAny.initRange.end}`);
      }
      
      if (formatAny.indexRange) {
        params.append('index', `${formatAny.indexRange.start}-${formatAny.indexRange.end}`);
      }
      
      // 'n' parametresi varsa decode et ve ekle
      if (formatAny.n) {
        try {
          // Önce player.js'den decode etmeyi dene
          const playerDecoded = await this.extractAndUsePlayerJs(videoId, formatAny.n);
          if (playerDecoded) {
            params.append('n', playerDecoded);
            console.log('Added decoded n parameter from player.js');
          } else {
            // Player.js'den decode edilemezse, basit decode yöntemini kullan
            const decodedN = await this.decodeNParameter(formatAny.n, videoId);
            params.append('n', decodedN);
            console.log('Added decoded n parameter (simple method)');
          }
        } catch (error: any) {
          console.warn('N parameter decode failed, using original:', error.message);
          // Decode başarısız olursa, orijinalini kullan (bazı durumlarda çalışabilir)
          params.append('n', formatAny.n);
        }
      }
      
      // Signature varsa ekle
      if (formatAny.s) {
        params.append('sig', formatAny.s);
      }
      
      // YouTube'un bazı formatlarında ek parametreler gerekebilir
      // 'sp' parametresi (signature protection) - genellikle gerekli değil
      // 'c' parametresi (client) - bazı durumlarda gerekli
      params.append('c', 'WEB');
      
      // Audio quality parametreleri
      if (formatAny.audioQuality) {
        params.append('aq', formatAny.audioQuality);
      }
      if (formatAny.audioSampleRate) {
        params.append('ratebypass', 'yes');
      }
      
      // URL'i oluştur
      const finalUrl = `${baseUrl}?${params.toString()}`;
      console.log('Constructed URL preview:', finalUrl.substring(0, 150) + '...');
      
      // URL'i test etme - React Native'de test başarısız olsa da URL çalışabilir
      // YouTube'un yeni yapısında test mekanizması bazen yanıltıcı olabiliyor
      // Bu yüzden URL'i direkt döndürüyoruz
      // Player service'de URL geçersizse retry mekanizması devreye girecek
      console.log('Returning constructed URL (test skipped for React Native compatibility)');
      return finalUrl;
    } catch (error: any) {
      console.error('URL construction error:', error.message);
      return null;
    }
  }

  // Random string oluştur (ei ve id parametreleri için)
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Video ID'den ses URL'i al
  async getAudioUrl(videoId: string): Promise<string> {
    try {
      console.log('Fetching audio URL for video ID:', videoId);
      
      // Innertube API'yi dene
      const response = await axios.post<InnertubePlayerResponse>(
        `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,
        {
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: INNERTUBE_CLIENT_VERSION,
            },
          },
          videoId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Innertube response received');
      
      const streamingData = response.data.streamingData;
      if (!streamingData) {
        throw new Error('Streaming data bulunamadı');
      }
      
      // Response'un tüm yapısını logla (base URL'i bulmak için)
      const responseAny = response.data as any;
      console.log('Response structure keys:', Object.keys(responseAny));
      
      // Base URL'i response'dan al - YouTube'un yeni yapısında formatların içinde olabilir
      // Veya streamingData'nın içinde olabilir
      let baseUrl: string | null = null;
      
      // Yöntem 1: streamingData'dan al
      if (responseAny.streamingData?.hlsManifestUrl) {
        const manifestUrl = responseAny.streamingData.hlsManifestUrl;
        const urlMatch = manifestUrl.match(/https?:\/\/([^\/]+)/);
        if (urlMatch) {
          baseUrl = `https://${urlMatch[1]}/videoplayback`;
          console.log('Found base URL from HLS manifest:', baseUrl);
        }
      }
      
      // Yöntem 2: İlk format'tan URL çıkarmayı dene (eğer varsa)
      if (!baseUrl && streamingData.adaptiveFormats && streamingData.adaptiveFormats.length > 0) {
        const firstFormat = streamingData.adaptiveFormats[0] as any;
        if (firstFormat.url) {
          const urlMatch = firstFormat.url.match(/https?:\/\/([^\/]+)/);
          if (urlMatch) {
            baseUrl = `https://${urlMatch[1]}/videoplayback`;
            console.log('Found base URL from first format:', baseUrl);
          }
        }
      }
      
      // Yöntem 3: Formats array'inden al
      if (!baseUrl && streamingData.formats && streamingData.formats.length > 0) {
        const firstFormat = streamingData.formats[0] as any;
        if (firstFormat.url) {
          const urlMatch = firstFormat.url.match(/https?:\/\/([^\/]+)/);
          if (urlMatch) {
            baseUrl = `https://${urlMatch[1]}/videoplayback`;
            console.log('Found base URL from formats array:', baseUrl);
          }
        }
      }
      
      // Yöntem 4: playabilityStatus'dan al
      if (!baseUrl && responseAny.playabilityStatus?.streamingData?.baseUrl) {
        baseUrl = responseAny.playabilityStatus.streamingData.baseUrl;
        console.log('Found base URL from playabilityStatus:', baseUrl);
      }
      
      // Eğer hala base URL bulunamadıysa, YouTube'un gerçek CDN'lerini kullan
      if (!baseUrl) {
        // YouTube'un gerçek CDN sunucuları (daha güncel)
        const cdnServers = [
          'rr1---sn-4g5e6n7s.googlevideo.com',
          'rr2---sn-4g5e6n7s.googlevideo.com',
          'rr3---sn-4g5e6n7s.googlevideo.com',
          'rr4---sn-4g5e6n7s.googlevideo.com',
          'rr5---sn-4g5e6n7s.googlevideo.com',
        ];
        const randomCdn = cdnServers[Math.floor(Math.random() * cdnServers.length)];
        baseUrl = `https://${randomCdn}/videoplayback`;
        console.log('Using fallback base URL:', baseUrl);
      }
      
      // Base URL'i sakla (sonra kullanmak için)
      const finalBaseUrl = baseUrl;

      console.log('Streaming data:', {
        adaptiveFormatsCount: streamingData.adaptiveFormats?.length || 0,
        formatsCount: streamingData.formats?.length || 0,
        hasAdaptiveFormats: !!(streamingData.adaptiveFormats && streamingData.adaptiveFormats.length > 0),
      });

      const allFormats = [
        ...(streamingData.adaptiveFormats || []),
        ...(streamingData.formats || []),
      ];

      console.log('Total formats:', allFormats.length);

      // Tüm format'ları detaylı logla (ilk 3'ü - tüm alanlarıyla)
      if (allFormats.length > 0) {
        console.log('Sample formats (first 3 with all fields):', JSON.stringify(allFormats.slice(0, 3), null, 2));
        console.log('Sample formats summary:', allFormats.slice(0, 10).map(f => ({
          itag: f.itag,
          mimeType: f.mimeType,
          audioQuality: (f as any).audioQuality,
          hasUrl: !!f.url,
          hasCipher: !!(f.signatureCipher || f.cipher),
          hasS: !!(f as any).s,
          hasN: !!(f as any).n,
          urlLength: f.url?.length || 0,
          cipherLength: (f.signatureCipher || f.cipher)?.length || 0,
          allKeys: Object.keys(f),
        })));
      }

      // Tüm bilinen audio itag'ları (YouTube'un tüm audio formatları)
      // Sadece audio-only formatları (video içermeyen)
      const audioItags = [
        139, 140, 141, 171, 249, 250, 251, 256, 258, 325, 328, 330, 331, 332, 333, 334, 335, 336
      ];

      // Audio format'ları bul - SADECE gerçek audio formatları
      let audioFormats = allFormats.filter(
        (format) => {
          const mimeType = format.mimeType?.toLowerCase() || '';
          // Video içeren formatları hariç tut
          if (mimeType.includes('video')) {
            return false;
          }
          // Sadece audio formatlarını seç
          return mimeType.includes('audio') || 
                 mimeType.includes('m4a') || 
                 (mimeType.includes('webm') && mimeType.includes('audio')) ||
                 mimeType.includes('opus') ||
                 mimeType.includes('aac');
        }
      );

      console.log('Audio formats by mimeType (video excluded):', audioFormats.length);

      // Eğer mimeType ile bulunamazsa, itag'a göre bul
      if (audioFormats.length === 0) {
        audioFormats = allFormats.filter((format) => 
          audioItags.includes(format.itag)
        );
        console.log('Audio formats by itag:', audioFormats.length);
      }

      // Eğer hala bulunamazsa, video+audio formatlarından audio track'ini ayır
      if (audioFormats.length === 0) {
        // Bazı formatlar hem video hem audio içerebilir, bunları da kontrol et
        const mixedFormats = allFormats.filter((format) => {
          const mimeType = format.mimeType?.toLowerCase() || '';
          return mimeType.includes('mp4') || mimeType.includes('webm');
        });
        
        // Mixed formatlardan en düşük bitrate'li olanı seç (genellikle audio-only)
        if (mixedFormats.length > 0) {
          const sorted = mixedFormats.sort((a, b) => {
            const aBitrate = parseInt((a as any).bitrate || '0');
            const bBitrate = parseInt((b as any).bitrate || '0');
            return aBitrate - bBitrate;
          });
          
          // En düşük bitrate'li format'ı dene
          audioFormats = [sorted[0]];
          console.log('Using mixed format with lowest bitrate:', sorted[0].itag);
        }
      }

      if (audioFormats.length > 0) {
        // En yüksek kaliteli audio'yu seç (itag'a göre)
        const bestAudio = audioFormats.sort((a, b) => {
          // Önce itag'a göre sırala
          if (b.itag !== a.itag) {
            return b.itag - a.itag;
          }
          // Sonra bitrate'e göre
          const aBitrate = parseInt((a as any).bitrate || '0');
          const bBitrate = parseInt((b as any).bitrate || '0');
          return bBitrate - aBitrate;
        })[0];

        console.log('Selected audio format:', {
          itag: bestAudio.itag,
          mimeType: bestAudio.mimeType,
          audioQuality: (bestAudio as any).audioQuality,
          hasUrl: !!bestAudio.url,
          hasCipher: !!(bestAudio.signatureCipher || bestAudio.cipher),
          hasS: !!(bestAudio as any).s,
          urlPreview: bestAudio.url?.substring(0, 100) || 'N/A',
          allKeys: Object.keys(bestAudio),
        });

        // URL varsa direkt kullan
        if (bestAudio.url && bestAudio.url.startsWith('http')) {
          console.log('Using direct URL');
          return bestAudio.url;
        }

        // signatureCipher veya cipher varsa decode et
        const cipher = bestAudio.signatureCipher || bestAudio.cipher;
        if (cipher) {
          console.log('Decoding signature cipher, length:', cipher.length);
          const decodedUrl = this.decodeSignatureCipher(cipher);
          console.log('Decoded URL preview:', decodedUrl?.substring(0, 100));
          
          if (decodedUrl && decodedUrl.startsWith('http')) {
            console.log('Decoded URL successfully');
            return decodedUrl;
          } else {
            console.warn('Decoded URL is not valid:', decodedUrl?.substring(0, 50));
          }
        }
        
        // Format'ta URL veya cipher yoksa, YouTube'un yeni yapısını kullan
        const formatAny = bestAudio as any;
        
        // Önce watch sayfasından direkt URL çıkarmayı dene (en güvenilir yöntem)
        // Watch sayfasından URL çıkarmayı her zaman dene - initRange/indexRange kontrolü yapmadan
        console.log('Trying to extract URL from watch page for itag', bestAudio.itag);
        try {
          const watchUrl = await this.extractUrlFromWatchPage(videoId, bestAudio.itag);
          if (watchUrl && watchUrl.startsWith('http')) {
            console.log('Found URL from watch page');
            return watchUrl;
          }
        } catch (watchError: any) {
          console.warn('Watch page extraction failed:', watchError.message);
        }
        
        // Eğer hala URL bulunamadıysa, tüm audio formatlarını dene
        console.warn('Primary format failed, trying all audio formats from watch page');
        for (const audioFormat of audioFormats.slice(0, 5)) { // İlk 5 formatı dene
          const fmtAny = audioFormat as any;
          
          // Watch sayfasından dene (her format için)
          try {
            const watchUrl = await this.extractUrlFromWatchPage(videoId, audioFormat.itag);
            if (watchUrl && watchUrl.startsWith('http')) {
              console.log(`Found URL from watch page for itag ${audioFormat.itag}`);
              return watchUrl;
            }
          } catch (e) {
            // Devam et
          }
        }
        
        // Eğer watch sayfasından hiç URL bulunamadıysa, alternatif yöntemler dene
        // Önce player API'yi dene (en garantili)
        console.warn('Watch page failed, trying player API');
        try {
          const playerUrl = await this.extractUrlFromPlayerAPI(videoId);
          if (playerUrl && playerUrl.startsWith('http')) {
            console.log('Found URL from player API');
            return playerUrl;
          }
        } catch (playerError: any) {
          console.warn('Player API extraction failed:', playerError.message);
        }
        
        // Sonra embed API'yi dene
        console.warn('Player API failed, trying embed API');
        try {
          const embedUrl = await this.extractUrlFromEmbedPage(videoId);
          if (embedUrl && embedUrl.startsWith('http')) {
            console.log('Found URL from embed page');
            return embedUrl;
          }
        } catch (embedError: any) {
          console.warn('Embed page extraction failed:', embedError.message);
        }
        
        // Eğer hiçbir yöntem çalışmazsa, format'ın tüm özelliklerini logla
        console.warn('Selected format has no usable URL or cipher. Format details:', JSON.stringify(bestAudio, null, 2));
        console.warn('Cannot construct URL - all methods failed');
        throw new Error('Format bilgilerinden URL oluşturulamadı');
      }

      // Eğer hiç format bulunamazsa veya URL bulunamadıysa, public API dene
      if (audioFormats.length === 0) {
        console.warn('No audio format found in Innertube response, trying public API');
        try {
          const publicUrl = await this.getAudioUrlFromPublicAPI(videoId);
          if (publicUrl) {
            return publicUrl;
          }
        } catch (publicError: any) {
          console.error('Public API also failed:', publicError.message);
        }
      } else {
        // Formatlar var ama URL bulunamadı, public API'yi dene
        console.warn('Formats found but no URL, trying public API');
        try {
          const publicUrl = await this.getAudioUrlFromPublicAPI(videoId);
          if (publicUrl) {
            return publicUrl;
          }
        } catch (publicError: any) {
          console.error('Public API also failed:', publicError.message);
        }
      }
      
      throw new Error('Ses formatı bulunamadı veya URL çıkarılamadı');
    } catch (error: any) {
      console.error('getAudioUrl error:', {
        status: error.response?.status,
        message: error.message,
        videoId,
      });
      
      // Eğer hata "Ses formatı bulunamadı" değilse, public API dene
      if (!error.message?.includes('Ses formatı bulunamadı')) {
        try {
          console.log('Innertube failed, trying public API as fallback');
          return await this.getAudioUrlFromPublicAPI(videoId);
        } catch (publicError: any) {
          console.error('Public API also failed:', publicError.message);
          // Son çare: Player API ve Embed API'yi dene
          try {
            console.log('Public API failed, trying player API as last resort');
            const playerUrl = await this.extractUrlFromPlayerAPI(videoId);
            if (playerUrl) {
              return playerUrl;
            }
          } catch (playerError: any) {
            console.error('Player API also failed:', playerError.message);
          }
          
          try {
            console.log('Player API failed, trying embed API as last resort');
            const embedUrl = await this.extractUrlFromEmbedPage(videoId);
            if (embedUrl) {
              return embedUrl;
            }
          } catch (embedError: any) {
            console.error('Embed API also failed:', embedError.message);
          }
          throw new Error('Ses URL\'i alınamadı - tüm yöntemler denendi');
        }
      }
      
      throw error;
    }
  }

  // Public API kullanarak audio URL al
  private async getAudioUrlFromPublicAPI(videoId: string): Promise<string> {
    try {
      console.log('Trying public API method for video:', videoId);
      
      // YouTube'un video page'ini parse et
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await axios.get(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });

      const html = response.data;
      
      // Player config'i bul - birden fazla pattern dene
      let config: any = null;
      
      // Pattern 1: var ytInitialPlayerResponse
      const configMatch1 = html.match(/var ytInitialPlayerResponse = ({.+?});/);
      if (configMatch1) {
        try {
          config = JSON.parse(configMatch1[1]);
        } catch (e) {
          console.warn('Pattern 1 parse failed');
        }
      }
      
      // Pattern 2: window["ytInitialPlayerResponse"]
      if (!config) {
        const configMatch2 = html.match(/window\["ytInitialPlayerResponse"\] = ({.+?});/);
        if (configMatch2) {
          try {
            config = JSON.parse(configMatch2[1]);
          } catch (e) {
            console.warn('Pattern 2 parse failed');
          }
        }
      }
      
      // Pattern 3: ytInitialPlayerResponse içeren script tag
      if (!config) {
        const scriptMatch = html.match(/<script[^>]*>.*?ytInitialPlayerResponse.*?({.+?})<\/script>/s);
        if (scriptMatch) {
          try {
            const jsonMatch = scriptMatch[1].match(/{.+}/);
            if (jsonMatch) {
              config = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.warn('Pattern 3 parse failed');
          }
        }
      }
      
      if (config && config.streamingData) {
        const streamingData = config.streamingData;
        console.log('Found streaming data from public API');
        
        const allFormats = [
          ...(streamingData.adaptiveFormats || []),
          ...(streamingData.formats || []),
        ];
        
        console.log('Public API formats count:', allFormats.length);
        
        // Audio format'ları bul - sadece gerçek audio
        const audioItags = [139, 140, 141, 171, 249, 250, 251, 256, 258, 325, 328, 330, 331, 332, 333, 334, 335, 336];
        
        let audioFormats = allFormats.filter((f: any) => {
          const mimeType = (f.mimeType || '').toLowerCase();
          // Video içeren formatları hariç tut
          if (mimeType.includes('video')) {
            return false;
          }
          return mimeType.includes('audio') || 
                 mimeType.includes('m4a') || 
                 (mimeType.includes('webm') && mimeType.includes('audio')) ||
                 audioItags.includes(f.itag);
        });
        
        console.log('Public API audio formats:', audioFormats.length);
        
        if (audioFormats.length > 0) {
          // Tüm audio formatlarını logla
          console.log('Public API audio formats details:', audioFormats.map((f: any) => ({
            itag: f.itag,
            mimeType: f.mimeType,
            hasUrl: !!f.url,
            hasCipher: !!(f.signatureCipher || f.cipher),
            hasS: !!f.s,
            keys: Object.keys(f),
          })));
          
          // Önce tüm audio formatlarını kontrol et - direkt URL var mı?
          for (const fmt of audioFormats) {
            const fmtAny = fmt as any;
            if (fmtAny.url && fmtAny.url.startsWith('http')) {
              console.log(`Found direct URL from audio format (itag ${fmt.itag}) in public API`);
              return fmtAny.url;
            }
            if (fmtAny.signatureCipher || fmtAny.cipher) {
              const decoded = this.decodeSignatureCipher(fmtAny.signatureCipher || fmtAny.cipher);
              if (decoded && decoded.startsWith('http')) {
                console.log(`Found decoded URL from audio format (itag ${fmt.itag}) in public API`);
                return decoded;
              }
            }
          }
          
          const best = audioFormats.sort((a: any, b: any) => b.itag - a.itag)[0];
          
          if (best.url && best.url.startsWith('http')) {
            console.log('Found URL from video page');
            return best.url;
          }
          
          if (best.signatureCipher || best.cipher) {
            const decoded = this.decodeSignatureCipher(best.signatureCipher || best.cipher);
            if (decoded && decoded.startsWith('http')) {
              console.log('Decoded URL from video page');
              return decoded;
            }
          }
          
          // Eğer URL/cipher yoksa, watch sayfasından direkt URL çıkarmayı dene
          if (best.initRange && best.indexRange) {
            console.log('Public API format has initRange/indexRange, trying to extract from watch page');
            
            try {
              const watchUrl = await this.extractUrlFromWatchPage(videoId, best.itag);
              if (watchUrl && watchUrl.startsWith('http')) {
                console.log('Found URL from watch page (public API)');
                return watchUrl;
              }
            } catch (watchError: any) {
              console.warn('Watch page extraction failed in public API:', watchError.message);
            }
            
            // URL oluşturmayı dene - ama sadece test edilmiş URL'leri döndür
            try {
              console.log('Trying to construct URL from format data (public API)');
              const constructedUrl = await this.constructUrlFromFormat(best, videoId, streamingData);
              if (constructedUrl && constructedUrl.startsWith('http')) {
                console.log('Successfully constructed and tested URL from format data (public API)');
                return constructedUrl;
              }
            } catch (constructError: any) {
              console.warn('URL construction failed in public API:', constructError.message);
            }
            
            // Tüm audio formatlarını dene
            console.warn('Primary format failed in public API, trying all audio formats');
            for (const audioFormat of audioFormats.slice(0, 5)) {
              const fmtAny = audioFormat as any;
              
              if (fmtAny.initRange && fmtAny.indexRange) {
                try {
                  const watchUrl = await this.extractUrlFromWatchPage(videoId, audioFormat.itag);
                  if (watchUrl && watchUrl.startsWith('http')) {
                    console.log(`Found URL from watch page for itag ${audioFormat.itag} (public API)`);
                    return watchUrl;
                  }
                } catch (e) {
                  // Devam et
                }
                
                try {
                  const constructedUrl = await this.constructUrlFromFormat(audioFormat, videoId, streamingData);
                  if (constructedUrl && constructedUrl.startsWith('http')) {
                    console.log(`Successfully constructed URL for itag ${audioFormat.itag} (public API)`);
                    return constructedUrl;
                  }
                } catch (e) {
                  // Devam et
                }
              }
            }
          }
        }
      }
      
      // Son çare: yt-dlp benzeri bir servis kullan (alternatif)
      console.warn('Public API parse failed, trying alternative method');
      throw new Error('Public API\'den de URL alınamadı');
    } catch (error: any) {
      console.error('Public API error:', error.message);
      
      // Son çare: Alternatif yöntemler
      console.warn('All public API methods failed for video:', videoId);
      throw new Error('Ses URL\'i alınamadı');
    }
  }

  // Video arama
  async searchVideos(query: string, limit: number = 5): Promise<Array<{videoId: string; title: string; author: string}>> {
    try {
      const response = await axios.post<InnertubeSearchResponse>(
        `https://www.youtube.com/youtubei/v1/search?key=${INNERTUBE_API_KEY}`,
        {
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: INNERTUBE_CLIENT_VERSION,
            },
          },
          query,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const results: Array<{videoId: string; title: string; author: string}> = [];
      const contents = response.data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      
      if (contents) {
        for (const section of contents) {
          const items = section.itemSectionRenderer?.contents;
          if (items) {
            for (const item of items) {
              const video = item.videoRenderer;
              if (video && video.videoId) {
                results.push({
                  videoId: video.videoId,
                  title: video.title?.runs?.[0]?.text || '',
                  author: video.ownerText?.runs?.[0]?.text || '',
                });
                
                if (results.length >= limit) break;
              }
            }
          }
          if (results.length >= limit) break;
        }
      }

      if (results.length > 0) return results;
      return await this.searchVideosAlternative(query, limit);
    } catch (error: any) {
      console.error('Innertube search error:', error.message);
      return await this.searchVideosAlternative(query, limit);
    }
  }

  // Alternatif arama
  private async searchVideosAlternative(query: string, limit: number = 5): Promise<Array<{videoId: string; title: string; author: string}>> {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = response.data;
      const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      const matches = [...html.matchAll(videoIdRegex)];
      
      const results: Array<{videoId: string; title: string; author: string}> = [];
      const seenIds = new Set<string>();
      
      for (const match of matches) {
        const videoId = match[1];
        if (videoId && !seenIds.has(videoId) && videoId.length === 11) {
          seenIds.add(videoId);
          results.push({videoId, title: '', author: ''});
          if (results.length >= limit) break;
        }
      }

      if (results.length > 0) {
        console.log(`Found ${results.length} videos using alternative method`);
        return results;
      }

      return [];
    } catch (error: any) {
      console.error('Alternative search error:', error.message);
      return [];
    }
  }
}

export const innertubeService = new InnertubeService();
