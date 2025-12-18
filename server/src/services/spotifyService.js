const SpotifyWebApi = require('spotify-web-api-node');

/**
 * Spotify API servisi
 * Access token'ı otomatik olarak yönetir ve yeniler
 */
class SpotifyService {
  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    this.accessToken = null;
    this.tokenExpirationTime = null;
  }

  /**
   * Access token'ı alır veya yeniler
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Token hala geçerliyse mevcut token'ı döndür
    if (this.accessToken && this.tokenExpirationTime && Date.now() < this.tokenExpirationTime) {
      return this.accessToken;
    }

    // Yeni token al
    try {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        throw new Error('SPOTIFY_CLIENT_ID ve SPOTIFY_CLIENT_SECRET environment variable\'ları ayarlanmalı');
      }

      const data = await this.spotifyApi.clientCredentialsGrant();
      this.accessToken = data.body.access_token;
      
      // Token'ın süresini ayarla (genellikle 3600 saniye = 1 saat)
      // 5 dakika önceden yenilemek için buffer ekle
      const expiresIn = data.body.expires_in || 3600;
      this.tokenExpirationTime = Date.now() + (expiresIn - 300) * 1000;

      this.spotifyApi.setAccessToken(this.accessToken);
      
      console.log('✅ Spotify access token alındı');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Spotify access token alınamadı:', error.message);
      throw new Error(`Spotify token hatası: ${error.message}`);
    }
  }

  /**
   * Spotify'da arama yapar
   * @param {string} query - Arama sorgusu
   * @param {number} limit - Sonuç sayısı (varsayılan: 15)
   * @returns {Promise<Array>} Arama sonuçları
   */
  async searchTracks(query, limit = 15) {
    try {
      await this.getAccessToken();

      const response = await this.spotifyApi.searchTracks(query, {
        limit: Math.min(limit, 50), // Spotify max 50 sonuç döndürür
        market: 'TR', // Türkiye pazarı
      });

      if (!response.body.tracks || !response.body.tracks.items) {
        return [];
      }

      // Spotify sonuçlarını formatla
      const tracks = response.body.tracks.items.map((track) => {
        // En yüksek kaliteli album art'ı al
        let albumArt = null;
        if (track.album && track.album.images && track.album.images.length > 0) {
          // En büyük görseli al (genellikle ilk sırada)
          albumArt = track.album.images[0].url;
        }

        // Sanatçı isimlerini birleştir
        const artistNames = track.artists
          .map((artist) => artist.name)
          .join(', ');

        return {
          spotify_id: track.id,
          track_name: track.name,
          artist_name: artistNames,
          album_art: albumArt,
          album_name: track.album?.name || null,
          duration_ms: track.duration_ms,
          preview_url: track.preview_url,
        };
      });

      return tracks;
    } catch (error) {
      console.error('❌ Spotify arama hatası:', error.message);
      throw new Error(`Spotify arama hatası: ${error.message}`);
    }
  }

  /**
   * Spotify track ID'sine göre track bilgilerini alır
   * @param {string} spotifyId - Spotify track ID
   * @returns {Promise<Object>} Track bilgileri
   */
  async getTrack(spotifyId) {
    try {
      await this.getAccessToken();

      const response = await this.spotifyApi.getTrack(spotifyId);

      if (!response.body) {
        throw new Error('Track bulunamadı');
      }

      const track = response.body;

      // En yüksek kaliteli album art'ı al
      let albumArt = null;
      if (track.album && track.album.images && track.album.images.length > 0) {
        albumArt = track.album.images[0].url;
      }

      // Sanatçı isimlerini birleştir
      const artistNames = track.artists
        .map((artist) => artist.name)
        .join(', ');

      return {
        spotify_id: track.id,
        track_name: track.name,
        artist_name: artistNames,
        album_art: albumArt,
        album_name: track.album?.name || null,
        duration_ms: track.duration_ms,
        preview_url: track.preview_url,
      };
    } catch (error) {
      console.error('❌ Spotify track bilgisi alınamadı:', error.message);
      throw new Error(`Spotify track hatası: ${error.message}`);
    }
  }
}

// Singleton instance
const spotifyService = new SpotifyService();

module.exports = spotifyService;




