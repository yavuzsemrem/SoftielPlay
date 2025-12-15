import firestore from '@react-native-firebase/firestore';
import type {Playlist} from '@types';

class FirebaseService {
  private playlistsCollection = firestore().collection('playlists');

  // Playlist oluştur
  async createPlaylist(
    userId: string,
    playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Playlist> {
    const now = Date.now();
    const newPlaylist: Playlist = {
      ...playlist,
      id: `playlist_${now}`,
      createdAt: now,
      updatedAt: now,
    };

    await this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .doc(newPlaylist.id)
      .set(newPlaylist);

    return newPlaylist;
  }

  // Kullanıcının playlistlerini getir
  async getUserPlaylists(userId: string): Promise<Playlist[]> {
    const snapshot = await this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .get();

    return snapshot.docs.map((doc) => doc.data() as Playlist);
  }

  // Playlist güncelle
  async updatePlaylist(
    userId: string,
    playlistId: string,
    updates: Partial<Playlist>,
  ): Promise<void> {
    await this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .doc(playlistId)
      .update({
        ...updates,
        updatedAt: Date.now(),
      });
  }

  // Playlist sil
  async deletePlaylist(userId: string, playlistId: string): Promise<void> {
    await this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .doc(playlistId)
      .delete();
  }

  // Playlist'e şarkı ekle
  async addTrackToPlaylist(
    userId: string,
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    const playlistRef = this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .doc(playlistId);

    const playlist = await playlistRef.get();
    const currentTracks = (playlist.data()?.tracks as string[]) || [];

    if (!currentTracks.includes(trackId)) {
      await playlistRef.update({
        tracks: [...currentTracks, trackId],
        updatedAt: Date.now(),
      });
    }
  }

  // Playlist'ten şarkı çıkar
  async removeTrackFromPlaylist(
    userId: string,
    playlistId: string,
    trackId: string,
  ): Promise<void> {
    const playlistRef = this.playlistsCollection
      .doc(userId)
      .collection('user_playlists')
      .doc(playlistId);

    const playlist = await playlistRef.get();
    const currentTracks = (playlist.data()?.tracks as string[]) || [];

    await playlistRef.update({
      tracks: currentTracks.filter((id) => id !== trackId),
      updatedAt: Date.now(),
    });
  }
}

export const firebaseService = new FirebaseService();




