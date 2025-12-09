// Müzik parça tipi
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration: number;
  url: string;
  source: 'spotify' | 'youtube' | 'local';
  spotifyId?: string;
  youtubeId?: string;
  localPath?: string;
  isDownloaded: boolean;
  createdAt: number;
}

// Playlist tipi
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: string[]; // Track ID'leri
  artwork?: string;
  createdAt: number;
  updatedAt: number;
}

// Spotify API response tipleri
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url?: string;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

// YouTube API response tipleri
export interface YouTubeVideo {
  videoId: string;
  title: string;
  author: string;
  lengthSeconds: number;
  thumbnails: Array<{ url: string }>;
}

// Player state
export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  playbackRate: number;
  repeatMode: 'off' | 'track' | 'queue';
  shuffle: boolean;
}

