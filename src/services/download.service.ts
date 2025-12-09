import RNFS from 'react-native-fs';
import {youtubeService} from './youtube.service';
import {Storage} from '@utils/storage';
import {STORAGE_KEYS} from '@constants';
import {useTrackStore} from '@store/track.store';
import type {Track} from '@types';

class DownloadService {
  private downloadDir = `${RNFS.DocumentDirectoryPath}/downloads`;

  async initialize(): Promise<void> {
    // Download klasörünü oluştur
    const exists = await RNFS.exists(this.downloadDir);
    if (!exists) {
      await RNFS.mkdir(this.downloadDir);
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
      const filePath = `${this.downloadDir}/${fileName}`;

      // İndir
      const downloadResult = await RNFS.downloadFile({
        fromUrl: audioUrl,
        toFile: filePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Track'i güncelle
        useTrackStore.getState().updateTrack(track.id, {
          localPath: filePath,
          isDownloaded: true,
        });

        // İndirilen track listesine ekle
        const downloadedTracks =
          Storage.get<string[]>(STORAGE_KEYS.DOWNLOADED_TRACKS) || [];
        if (!downloadedTracks.includes(track.id)) {
          Storage.set(STORAGE_KEYS.DOWNLOADED_TRACKS, [
            ...downloadedTracks,
            track.id,
          ]);
        }

        useTrackStore.getState().markAsDownloaded(track.id);

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
      const track = useTrackStore.getState().getTrack(trackId);
      if (track?.localPath) {
        const exists = await RNFS.exists(track.localPath);
        if (exists) {
          await RNFS.unlink(track.localPath);
        }
      }

      useTrackStore.getState().markAsNotDownloaded(trackId);

      // İndirilen track listesinden çıkar
      const downloadedTracks =
        Storage.get<string[]>(STORAGE_KEYS.DOWNLOADED_TRACKS) || [];
      Storage.set(
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

