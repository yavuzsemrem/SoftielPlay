import {create} from 'zustand';
import type {Track} from '@types';
import {Storage} from '@utils/storage';
import {STORAGE_KEYS} from '@constants';

interface TrackStore {
  tracks: Track[];
  downloadedTracks: string[]; // Track ID'leri

  // Actions
  loadTracks: () => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  markAsDownloaded: (trackId: string) => void;
  markAsNotDownloaded: (trackId: string) => void;
  getTrack: (trackId: string) => Track | undefined;
}

export const useTrackStore = create<TrackStore>((set, get) => ({
  tracks: [],
  downloadedTracks: [],

  loadTracks: () => {
    const tracks = Storage.get<Track[]>(STORAGE_KEYS.TRACKS) || [];
    const downloadedTracks =
      Storage.get<string[]>(STORAGE_KEYS.DOWNLOADED_TRACKS) || [];
    set({tracks, downloadedTracks});
  },

  addTrack: (track) => {
    set((state) => {
      // Duplicate kontrolü
      if (state.tracks.find((t) => t.id === track.id)) {
        return state;
      }

      const tracks = [...state.tracks, track];
      Storage.set(STORAGE_KEYS.TRACKS, tracks);
      return {tracks};
    });
  },

  removeTrack: (trackId) => {
    set((state) => {
      const tracks = state.tracks.filter((t) => t.id !== trackId);
      const downloadedTracks = state.downloadedTracks.filter(
        (id) => id !== trackId,
      );
      Storage.set(STORAGE_KEYS.TRACKS, tracks);
      Storage.set(STORAGE_KEYS.DOWNLOADED_TRACKS, downloadedTracks);
      return {tracks, downloadedTracks};
    });
  },

  updateTrack: (trackId, updates) => {
    set((state) => {
      const tracks = state.tracks.map((track) => {
        if (track.id === trackId) {
          return {...track, ...updates};
        }
        return track;
      });
      Storage.set(STORAGE_KEYS.TRACKS, tracks);
      return {tracks};
    });
  },

  markAsDownloaded: (trackId) => {
    set((state) => {
      const downloadedTracks = state.downloadedTracks.includes(trackId)
        ? state.downloadedTracks
        : [...state.downloadedTracks, trackId];

      const tracks = state.tracks.map((track) => {
        if (track.id === trackId) {
          return {...track, isDownloaded: true};
        }
        return track;
      });

      Storage.set(STORAGE_KEYS.DOWNLOADED_TRACKS, downloadedTracks);
      Storage.set(STORAGE_KEYS.TRACKS, tracks);
      return {tracks, downloadedTracks};
    });
  },

  markAsNotDownloaded: (trackId) => {
    set((state) => {
      const downloadedTracks = state.downloadedTracks.filter(
        (id) => id !== trackId,
      );

      const tracks = state.tracks.map((track) => {
        if (track.id === trackId) {
          return {...track, isDownloaded: false};
        }
        return track;
      });

      Storage.set(STORAGE_KEYS.DOWNLOADED_TRACKS, downloadedTracks);
      Storage.set(STORAGE_KEYS.TRACKS, tracks);
      return {tracks, downloadedTracks};
    });
  },

  getTrack: (trackId) => {
    return get().tracks.find((t) => t.id === trackId);
  },
}));

