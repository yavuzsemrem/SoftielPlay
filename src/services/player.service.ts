import TrackPlayer, {
  Capability,
  State,
  Event,
  RepeatMode,
} from 'react-native-track-player';
import type {Track} from '@types';
import {youtubeService} from './youtube.service';

class PlayerService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await TrackPlayer.setupPlayer({});
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });

    this.isInitialized = true;
  }

  async addTrack(track: Track): Promise<void> {
    try {
      // Eğer URL yoksa YouTube'dan al
      let url = track.url;
      if (!url && track.source === 'youtube') {
        url = await youtubeService.findAndGetTrackUrl(track);
      }

      await TrackPlayer.add({
        id: track.id,
        url: url || track.url,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
      });
    } catch (error) {
      console.error('Add track error:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    await TrackPlayer.play();
  }

  async pause(): Promise<void> {
    await TrackPlayer.pause();
  }

  async skipToNext(): Promise<void> {
    await TrackPlayer.skipToNext();
  }

  async skipToPrevious(): Promise<void> {
    await TrackPlayer.skipToPrevious();
  }

  async seekTo(position: number): Promise<void> {
    await TrackPlayer.seekTo(position);
  }

  async setRepeatMode(mode: RepeatMode): Promise<void> {
    await TrackPlayer.setRepeatMode(mode);
  }

  async getState(): Promise<State> {
    return await TrackPlayer.getState();
  }

  async getPosition(): Promise<number> {
    return await TrackPlayer.getPosition();
  }

  async getDuration(): Promise<number> {
    return await TrackPlayer.getDuration();
  }

  async getCurrentTrack(): Promise<Track | null> {
    const track = await TrackPlayer.getActiveTrack();
    if (!track) {
      return null;
    }

    // Track objesini geri döndür
    return {
      id: track.id || '',
      title: track.title || '',
      artist: track.artist || '',
      artwork: track.artwork as string,
      duration: track.duration || 0,
      url: track.url || '',
      source: 'youtube',
      isDownloaded: false,
      createdAt: Date.now(),
    };
  }

  async reset(): Promise<void> {
    await TrackPlayer.reset();
  }
}

export const playerService = new PlayerService();

