import * as FileSystem from 'expo-file-system';
import {youtubeService} from './youtube.service';
import {Storage} from '@utils/storage';
import {STORAGE_KEYS} from '@constants';
import {useTrackStore} from '@store/track.store';
import type {Track} from '@types';

class DownloadService {
  private downloadDir = `${FileSystem.documentDirectory}downloads/`;

  async initialize(): Promise<void> {
    // Download klasörünü oluştur
    const dirInfo = await FileSystem.getInfoAsync(this.downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.downloadDir, {intermediates: true});
    }
  }

  // Track'i indir
  async downloadTrack(track: Track): Promise<string> {
    try {
      await this.initialize();

      // YouTube'dan ses URL'ini al
      const audioUrl = await youtubeService.findAndGetTrackUrl(track);

      // Dosya adı oluştur
      const fileName = `${track.id}.mp3`;
      const filePath = `${this.downloadDir}${fileName}`;

      // İndir
      const downloadResult = await FileSystem.downloadAsync(audioUrl, filePath);

      if (downloadResult.status === 200) {
        // Track store'dan güncelle
        const trackStore = useTrackStore.getState();
        trackStore.updateTrack(track.id, {
          localPath: filePath,
          isDownloaded: true,
        });

        // İndirilen track listesine ekle
        const downloadedTracks =
          (await Storage.get<string[]>(STORAGE_KEYS.DOWNLOADED_TRACKS)) || [];
        if (!downloadedTracks.includes(track.id)) {
          await Storage.set(STORAGE_KEYS.DOWNLOADED_TRACKS, [
            ...downloadedTracks,
            track.id,
          ]);
        }

        trackStore.markAsDownloaded(track.id);

        return filePath;
      } else {
        throw new Error('İndirme başarısız');
      }
    } catch (error) {
      console.error('Download track error:', error);
      throw error;
    }
  }

  // İndirilen track'i sil
  async deleteDownloadedTrack(trackId: string): Promise<void> {
    try {
      const trackStore = useTrackStore.getState();
      const track = trackStore.getTrack(trackId);

      if (track?.localPath) {
        const fileInfo = await FileSystem.getInfoAsync(track.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(track.localPath, {idempotent: true});
        }
      }

      trackStore.markAsNotDownloaded(trackId);

      // İndirilen track listesinden çıkar
      const downloadedTracks =
        (await Storage.get<string[]>(STORAGE_KEYS.DOWNLOADED_TRACKS)) || [];
      await Storage.set(
        STORAGE_KEYS.DOWNLOADED_TRACKS,
        downloadedTracks.filter((id) => id !== trackId),
      );
    } catch (error) {
      console.error('Delete downloaded track error:', error);
      throw error;
    }
  }

  // İndirilen track'in yolunu al
  getDownloadedTrackPath(trackId: string): string | null {
    const track = useTrackStore.getState().getTrack(trackId);
    return track?.localPath || null;
  }
}

export const downloadService = new DownloadService();
