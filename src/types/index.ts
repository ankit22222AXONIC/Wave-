export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  dateAdded: number; // timestamp
  audioBlob: Blob;
  coverBlob?: Blob;
  coverUrl?: string; // cached or runtime ObjectURL
  isLiked: boolean;
  fileSize: number;
  format: string; // e.g. "mp3", "wav", "m4a", "flac"
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  songIds: string[];
  coverBlob?: Blob;
}

export type ActivePage = 
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'liked' }
  | { type: 'playlist'; playlistId: string };

export type RepeatMode = 'off' | 'all' | 'one';
