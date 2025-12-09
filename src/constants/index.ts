// Spotify API
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// YouTube
export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

// Storage keys
export const STORAGE_KEYS = {
  TRACKS: 'tracks',
  PLAYlists: 'playlists',
  SETTINGS: 'settings',
  DOWNLOADED_TRACKS: 'downloaded_tracks',
} as const;

// Player constants
export const PLAYER_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ERROR: 'error',
} as const;

// Repeat modes
export const REPEAT_MODES = {
  OFF: 'off',
  TRACK: 'track',
  QUEUE: 'queue',
} as const;

