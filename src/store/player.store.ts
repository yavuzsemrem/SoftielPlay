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
  updatePosition: () => Promise<void>;
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
      // Önceki interval'i temizle
      const prevInterval = (get() as any)._positionInterval;
      if (prevInterval) {
        clearInterval(prevInterval);
      }

      console.log('Playing track:', track.title, 'by', track.artist);
      
      // Track'ın duration'ını önce set et (Spotify'dan gelen duration)
      set({
        currentTrack: track,
        duration: track.duration || 0,
        position: 0,
        isPlaying: false,
      });
      
      await playerService.addTrack(track);
      
      // Track yüklendikten sonra biraz bekle
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      await playerService.play();
      
      // Player'dan gerçek duration'ı al (eğer track.duration yoksa)
      setTimeout(async () => {
        const playerDuration = await playerService.getDuration();
        if (playerDuration > 0) {
          set({duration: playerDuration});
        } else if (track.duration > 0) {
          // Eğer player'dan duration alınamazsa, track'tan gelen duration'ı kullan
          set({duration: track.duration});
        }
      }, 1000);
      
      set({
        isPlaying: true,
      });
      
      // Position güncellemelerini başlat
      const interval = setInterval(async () => {
        try {
          const position = await playerService.getPosition();
          const state = await playerService.getState();
          const playerDuration = await playerService.getDuration();
          
          // Duration'ı güncelle (eğer player'dan alınabiliyorsa)
          const finalDuration = playerDuration > 0 ? playerDuration : (track.duration || 0);
          
          set({
            position,
            duration: finalDuration,
            isPlaying: state === 'playing',
          });
        } catch (error) {
          console.error('Position update error:', error);
        }
      }, 1000);
      
      // Store'da interval'i sakla (cleanup için)
      (get() as any)._positionInterval = interval;
    } catch (error: any) {
      console.error('Play track error:', error);
      set({isPlaying: false});
      // Kullanıcıya hata mesajı göster
      throw new Error(error.message || 'Şarkı çalınamadı. Lütfen tekrar deneyin.');
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
    const {queue, currentTrack} = get();
    try {
      if (queue.length > 0 && currentTrack) {
        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        const nextTrack = queue[nextIndex];
        if (nextTrack) {
          await get().playTrack(nextTrack);
        }
      } else {
        await playerService.skipToNext();
        const track = await playerService.getCurrentTrack();
        set({currentTrack: track});
      }
    } catch (error) {
      console.error('Skip to next error:', error);
    }
  },

  skipToPrevious: async () => {
    const {queue, currentTrack} = get();
    try {
      if (queue.length > 0 && currentTrack) {
        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        const prevTrack = queue[prevIndex];
        if (prevTrack) {
          await get().playTrack(prevTrack);
        }
      } else {
        await playerService.skipToPrevious();
        const track = await playerService.getCurrentTrack();
        set({currentTrack: track});
      }
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

  updatePosition: async () => {
    try {
      const {currentTrack} = get();
      const position = await playerService.getPosition();
      const playerDuration = await playerService.getDuration();
      const state = await playerService.getState();
      
      // Duration'ı belirle: önce player'dan, sonra track'tan
      const duration = playerDuration > 0 ? playerDuration : (currentTrack?.duration || 0);
      
      set({
        position,
        duration,
        isPlaying: state === 'playing',
      });
    } catch (error) {
      console.error('Update position error:', error);
    }
  },
}));
