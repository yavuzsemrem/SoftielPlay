import axios from 'axios';
import type {Track, YouTubeVideo} from '@types';
import {innertubeService} from '@utils/innertube';

class YouTubeService {
  // YouTube'dan video ara
  async searchVideos(query: string, limit: number = 20): Promise<YouTubeVideo[]> {
    try {
      const results = await innertubeService.searchVideos(query, limit);
      
      return results.map((result) => ({
        videoId: result.videoId,
        title: result.title,
        author: result.author,
        lengthSeconds: '0',
        thumbnails: [],
      }));
    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error('YouTube araması yapılamadı');
    }
  }

  // YouTube video ID'den ses URL'i al
  async getAudioUrl(videoId: string): Promise<string> {
    try {
      // Önce Innertube API'yi dene
      return await innertubeService.getAudioUrl(videoId);
    } catch (error) {
      console.error('Innertube API failed, trying alternative method:', error);
      
      // Alternatif yöntem: YouTube extractor kullan
      try {
        const {youtubeExtractor} = await import('@utils/youtube-extractor');
        return await youtubeExtractor.getAudioUrl(videoId);
      } catch (extractorError) {
        console.error('YouTube extractor also failed:', extractorError);
        throw new Error('Ses URL\'i alınamadı');
      }
    }
  }

  // YouTube video'yu Track'e çevir
  mapYouTubeVideoToTrack(video: YouTubeVideo, spotifyTrack?: Track): Track {
    return {
      id: `youtube_${video.videoId}`,
      title: spotifyTrack?.title || video.title,
      artist: spotifyTrack?.artist || video.author,
      album: spotifyTrack?.album,
      artwork: video.thumbnails[0]?.url || spotifyTrack?.artwork,
      duration: parseInt(video.lengthSeconds, 10),
      url: '', // getAudioUrl ile doldurulacak
      source: 'youtube',
      youtubeId: video.videoId,
      isDownloaded: false,
      createdAt: Date.now(),
    };
  }

  // Track için YouTube'da ara ve URL'i al
  async findAndGetTrackUrl(track: Track): Promise<string> {
    try {
      // Eğer zaten youtubeId varsa, direkt kullan
      if (track.youtubeId) {
        console.log('Using existing YouTube ID:', track.youtubeId);
        try {
          return await this.getAudioUrl(track.youtubeId);
        } catch (error) {
          console.error('Error getting audio URL for existing ID, will search again:', error);
          // Eğer mevcut ID ile URL alınamazsa, yeni arama yap
          track.youtubeId = undefined;
        }
      }

      // Spotify track'ı için YouTube'da arama yap
      const searchQuery = `${track.title} ${track.artist}`;
      console.log('Searching YouTube for:', searchQuery);
      
      const videos = await this.searchVideos(searchQuery, 1);
      
      if (videos.length > 0) {
        const videoId = videos[0].videoId;
        console.log('Found YouTube video ID:', videoId, 'for track:', track.title);
        
        // Video ID'yi track'a kaydet
        track.youtubeId = videoId;
        
        // Audio URL'i al
        const audioUrl = await this.getAudioUrl(videoId);
        console.log('Got audio URL for track:', track.title);
        return audioUrl;
      }

      throw new Error(`YouTube'da "${searchQuery}" için video bulunamadı`);
    } catch (error) {
      console.error('Find track URL error:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();
