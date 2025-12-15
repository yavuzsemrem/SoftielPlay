import {Audio} from 'expo-av';
import type {Track} from '@types';
import {youtubeService} from './youtube.service';

class PlayerService {
  private sound: Audio.Sound | null = null;
  private currentTrack: Track | null = null;

  async initialize(): Promise<void> {
    try {
      // SDK 54 için güncellenmiş audio mode ayarları
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio mode initialized');
    } catch (error) {
      console.error('Audio initialization error:', error);
      // Hata durumunda minimal ayarlarla tekrar dene
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
        console.log('Audio mode initialized with minimal settings');
      } catch (retryError) {
        console.error('Audio initialization retry error:', retryError);
      }
    }
  }

  async addTrack(track: Track): Promise<void> {
    try {
      console.log('Adding track:', {
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        source: track.source,
      });

      // Önceki sesi temizle
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Eğer URL yoksa YouTube'dan al
      let url = track.url;
      if (!url) {
        try {
          console.log('Fetching YouTube URL for track:', track.title);
          url = await youtubeService.findAndGetTrackUrl(track);
          console.log('Successfully got YouTube URL');
        } catch (error) {
          console.error('YouTube URL alınamadı:', error);
          throw new Error(`"${track.title}" şarkısı için YouTube'dan ses URL'i alınamadı. Lütfen tekrar deneyin.`);
        }
      }

      if (!url) {
        throw new Error('Ses URL\'i bulunamadı');
      }

      // URL'i doğrula
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Geçersiz URL formatı');
      }

      console.log('Loading track with URL:', url.substring(0, 100) + '...');
      console.log('Track duration from metadata:', track.duration, 'seconds');

      // Yeni ses oluştur - hata yönetimi ile
      let sound: Audio.Sound;
      try {
        const result = await Audio.Sound.createAsync(
          {uri: url},
          {
            shouldPlay: false,
            isMuted: false,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
          },
        );
        sound = result.sound;
      } catch (loadError: any) {
        console.error('Audio load error:', loadError);
        // Eğer URL geçersizse, tekrar YouTube'dan almayı dene
        if (loadError.message?.includes('NSURLErrorDomain') || loadError.message?.includes('-1003')) {
          console.log('URL geçersiz, YouTube\'dan tekrar alınıyor...');
          try {
            // Track'ın youtubeId'sini temizle ve tekrar al
            track.youtubeId = undefined;
            url = await youtubeService.findAndGetTrackUrl(track);
            console.log('Retry - Got new URL:', url.substring(0, 100) + '...');
            
            const retryResult = await Audio.Sound.createAsync(
              {uri: url},
              {
                shouldPlay: false,
                isMuted: false,
                volume: 1.0,
                rate: 1.0,
                shouldCorrectPitch: true,
              },
            );
            sound = retryResult.sound;
          } catch (retryError: any) {
            console.error('Retry failed:', retryError);
            throw new Error(`Şarkı yüklenemedi: ${retryError.message || 'Bilinmeyen hata'}`);
          }
        } else {
          throw loadError;
        }
      }

      this.sound = sound;
      this.currentTrack = track;
      
      // URL'i track'a kaydet (bir sonraki sefer için)
      track.url = url;

      console.log('Track loaded successfully');

      // Status güncellemeleri için listener ekle
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log('Track finished');
          }
          if (status.error) {
            console.error('Playback error:', status.error);
          }
        }
      });
    } catch (error) {
      console.error('Add track error:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.sound) {
      try {
        console.log('Playing track...');
        await this.sound.playAsync();
        console.log('Track playing');
      } catch (error) {
        console.error('Play error:', error);
        throw error;
      }
    } else {
      console.warn('No sound to play');
      throw new Error('Çalınacak ses yok');
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
        console.log('Track paused');
      } catch (error) {
        console.error('Pause error:', error);
      }
    }
  }

  async skipToNext(): Promise<void> {
    // Queue implementasyonu gerekir
    throw new Error('Queue implementasyonu gerekli');
  }

  async skipToPrevious(): Promise<void> {
    // Queue implementasyonu gerekir
    throw new Error('Queue implementasyonu gerekli');
  }

  async seekTo(position: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(position * 1000); // saniyeden ms'ye
      } catch (error) {
        console.error('Seek error:', error);
      }
    }
  }

  async setRepeatMode(mode: 'off' | 'track' | 'queue'): Promise<void> {
    if (this.sound) {
      const isLooping = mode === 'track';
      await this.sound.setIsLoopingAsync(isLooping);
    }
  }

  async getState(): Promise<'idle' | 'playing' | 'paused' | 'buffering' | 'error'> {
    if (!this.sound) {
      return 'idle';
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (!status.isLoaded) {
        return 'error';
      }

      if (status.isBuffering) {
        return 'buffering';
      }

      return status.isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.error('Get state error:', error);
      return 'error';
    }
  }

  async getPosition(): Promise<number> {
    if (!this.sound) {
      return 0;
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.positionMillis) {
        return status.positionMillis / 1000; // ms'den saniyeye
      }
    } catch (error) {
      console.error('Get position error:', error);
    }

    return 0;
  }

  async getDuration(): Promise<number> {
    if (!this.sound) {
      return 0;
    }

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        return status.durationMillis / 1000; // ms'den saniyeye
      }
    } catch (error) {
      console.error('Get duration error:', error);
    }

    return 0;
  }

  async getCurrentTrack(): Promise<Track | null> {
    return this.currentTrack;
  }

  async reset(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Reset error:', error);
      }
    }
    this.currentTrack = null;
  }
}

export const playerService = new PlayerService();
