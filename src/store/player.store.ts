import {create} from 'zustand';
import type {Track, PlayerState} from '@types';
import {playerService} from '@services/player.service';

interface PlayerStore extends PlayerState {
  // Actions
  setCurrentTrack: (track: Track | null) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'off' | 'track' | 'queue') => void;
  setShuffle: (shuffle: boolean) => void;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,
  playbackRate: 1,
  repeatMode: 'off',
  shuffle: false,

  setCurrentTrack: (track) => set({currentTrack: track}),

  addToQueue: (track) => set((state) => ({queue: [...state.queue, track]})),

  removeFromQueue: (trackId) =>
    set((state) => ({
      queue: state.queue.filter((t) => t.id !== trackId),
    })),

  clearQueue: () => set({queue: []}),

  setPlaying: (isPlaying) => set({isPlaying}),

  setPosition: (position) => set({position}),

  setDuration: (duration) => set({duration}),

  setRepeatMode: (mode) => set({repeatMode: mode}),

  setShuffle: (shuffle) => set({shuffle}),

  playTrack: async (track) => {
    try {
      await playerService.addTrack(track);
      await playerService.play();
      set({
        currentTrack: track,
        isPlaying: true,
      });
    } catch (error) {
      console.error('Play track error:', error);
    }
  },

  togglePlayPause: async () => {
    const {isPlaying} = get();
    try {
      if (isPlaying) {
        await playerService.pause();
        set({isPlaying: false});
      } else {
        await playerService.play();
        set({isPlaying: true});
      }
    } catch (error) {
      console.error('Toggle play/pause error:', error);
    }
  },

  skipToNext: async () => {
    try {
      await playerService.skipToNext();
      const track = await playerService.getCurrentTrack();
      set({currentTrack: track});
    } catch (error) {
      console.error('Skip to next error:', error);
    }
  },

  skipToPrevious: async () => {
    try {
      await playerService.skipToPrevious();
      const track = await playerService.getCurrentTrack();
      set({currentTrack: track});
    } catch (error) {
      console.error('Skip to previous error:', error);
    }
  },

  seekTo: async (position) => {
    try {
      await playerService.seekTo(position);
      set({position});
    } catch (error) {
      console.error('Seek error:', error);
    }
  },
}));

