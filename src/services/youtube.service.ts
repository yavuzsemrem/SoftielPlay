import axios from 'axios';
import type {Track, YouTubeVideo} from '@types';
import {YOUTUBE_BASE_URL} from '@constants';
import {innertubeService} from '@utils/innertube';

class YouTubeService {
  // YouTube'dan video ara
  async searchVideos(query: string, limit: number = 20): Promise<YouTubeVideo[]> {
    try {
      // Innertube API kullanarak arama yap
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
      // Innertube API kullanarak ses URL'i al
      return await innertubeService.getAudioUrl(videoId);
    } catch (error) {
      console.error('YouTube audio URL error:', error);
      throw new Error('Ses URL\'i alınamadı');
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
      if (track.youtubeId) {
        return await this.getAudioUrl(track.youtubeId);
      }

      // Spotify track'ı için YouTube'da ara
      const searchQuery = `${track.title} ${track.artist}`;
      const videos = await this.searchVideos(searchQuery, 1);

      if (videos.length > 0) {
        const videoId = videos[0].videoId;
        return await this.getAudioUrl(videoId);
      }

      throw new Error('YouTube\'da bulunamadı');
    } catch (error) {
      console.error('Find track URL error:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();

