import axios from 'axios';
import Constants from 'expo-constants';
import {SPOTIFY_API_BASE_URL, SPOTIFY_TOKEN_URL} from '@constants';
import type {SpotifyTrack, SpotifySearchResponse, Track} from '@types';

// Base64 encoding için helper fonksiyon
function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    // Web ortamı
    return btoa(str);
  }
  // React Native için
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const c = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    output +=
      chars.charAt((bitmap >> 18) & 63) +
      chars.charAt((bitmap >> 12) & 63) +
      (i + 1 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
      (i + 2 < str.length ? chars.charAt(bitmap & 63) : '=');
  }
  return output;
}

class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  // Client credentials flow için token al
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Expo'da .env değişkenleri expo-constants ile alınır
    const clientId = Constants.expoConfig?.extra?.spotifyClientId || '';
    const clientSecret = Constants.expoConfig?.extra?.spotifyClientSecret || '';

    if (!clientId || !clientSecret) {
      throw new Error('Spotify API credentials bulunamadı. app.json dosyasını kontrol edin.');
    }

    try {
      const credentials = `${clientId}:${clientSecret}`;
      const encodedCredentials = base64Encode(credentials);

      const response = await axios.post(
        SPOTIFY_TOKEN_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodedCredentials}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Spotify token error:', error);
      throw new Error('Spotify token alınamadı');
    }
  }

  // Müzik ara
  async searchTracks(query: string, limit: number = 20): Promise<Track[]> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get<SpotifySearchResponse>(
        `${SPOTIFY_API_BASE_URL}/search`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            q: query,
            type: 'track',
            limit,
          },
        },
      );

      return response.data.tracks.items.map(this.mapSpotifyTrackToTrack);
    } catch (error) {
      console.error('Spotify search error:', error);
      throw new Error('Arama yapılamadı');
    }
  }

  // Spotify track'ı Track tipine çevir
  private mapSpotifyTrackToTrack(spotifyTrack: SpotifyTrack): Track {
    return {
      id: `spotify_${spotifyTrack.id}`,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists.map(a => a.name).join(', '),
      album: spotifyTrack.album.name,
      artwork: spotifyTrack.album.images[0]?.url,
      duration: spotifyTrack.duration_ms / 1000, // ms'den saniyeye
      url: '', // YouTube'dan çekilecek
      source: 'spotify',
      spotifyId: spotifyTrack.id,
      isDownloaded: false,
      createdAt: Date.now(),
    };
  }

  // Track detayı al
  async getTrackDetails(trackId: string): Promise<Track | null> {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get<SpotifyTrack>(
        `${SPOTIFY_API_BASE_URL}/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return this.mapSpotifyTrackToTrack(response.data);
    } catch (error) {
      console.error('Spotify track details error:', error);
      return null;
    }
  }
}

export const spotifyService = new SpotifyService();

