import {create} from 'zustand';
import type {Playlist, Track} from '@types';
import {Storage} from '@utils/storage';
import {STORAGE_KEYS} from '@constants';

interface PlaylistStore {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;

  // Actions
  loadPlaylists: () => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  currentPlaylist: null,

  loadPlaylists: () => {
    const playlists = Storage.get<Playlist[]>(STORAGE_KEYS.PLAYlists) || [];
    set({playlists});
  },

  createPlaylist: (name, description) => {
    const newPlaylist: Playlist = {
      id: `playlist_${Date.now()}`,
      name,
      description,
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const playlists = [...state.playlists, newPlaylist];
      Storage.set(STORAGE_KEYS.PLAYlists, playlists);
      return {playlists};
    });

    return newPlaylist;
  },

  deletePlaylist: (playlistId) => {
    set((state) => {
      const playlists = state.playlists.filter((p) => p.id !== playlistId);
      Storage.set(STORAGE_KEYS.PLAYlists, playlists);
      return {playlists};
    });
  },

  addTrackToPlaylist: (playlistId, trackId) => {
    set((state) => {
      const playlists = state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          if (!playlist.tracks.includes(trackId)) {
            return {
              ...playlist,
              tracks: [...playlist.tracks, trackId],
              updatedAt: Date.now(),
            };
          }
        }
        return playlist;
      });
      Storage.set(STORAGE_KEYS.PLAYlists, playlists);
      return {playlists};
    });
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    set((state) => {
      const playlists = state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((id) => id !== trackId),
            updatedAt: Date.now(),
          };
        }
        return playlist;
      });
      Storage.set(STORAGE_KEYS.PLAYlists, playlists);
      return {playlists};
    });
  },

  setCurrentPlaylist: (playlist) => set({currentPlaylist: playlist}),

  updatePlaylist: (playlistId, updates) => {
    set((state) => {
      const playlists = state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            ...updates,
            updatedAt: Date.now(),
          };
        }
        return playlist;
      });
      Storage.set(STORAGE_KEYS.PLAYlists, playlists);
      return {playlists};
    });
  },
}));

