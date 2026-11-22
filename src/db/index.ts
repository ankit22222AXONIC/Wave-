import Dexie, { type Table } from 'dexie';
import type { Song, Playlist } from '../types';

export class WaveDatabase extends Dexie {
  songs!: Table<Song, string>;
  playlists!: Table<Playlist, string>;

  constructor() {
    super('WaveMusicDB');
    this.version(1).stores({
      songs: 'id, title, artist, album, dateAdded, isLiked',
      playlists: 'id, name, createdAt'
    });
  }
}

export const db = new WaveDatabase();

// DB Helper functions
export async function getAllSongs(): Promise<Song[]> {
  return await db.songs.orderBy('dateAdded').reverse().toArray();
}

export async function getSongById(id: string): Promise<Song | undefined> {
  return await db.songs.get(id);
}

export async function addSong(song: Song): Promise<void> {
  await db.songs.put(song);
}

export async function addMultipleSongs(songs: Song[]): Promise<void> {
  await db.songs.bulkPut(songs);
}

export async function deleteSong(id: string): Promise<void> {
  await db.songs.delete(id);
  // Also remove from all playlists
  const allPlaylists = await db.playlists.toArray();
  for (const pl of allPlaylists) {
    if (pl.songIds.includes(id)) {
      await db.playlists.update(pl.id, {
        songIds: pl.songIds.filter(sId => sId !== id)
      });
    }
  }
}

export async function toggleSongLike(id: string): Promise<boolean> {
  const song = await db.songs.get(id);
  if (!song) return false;
  const newLiked = !song.isLiked;
  await db.songs.update(id, { isLiked: newLiked });
  return newLiked;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  return await db.playlists.orderBy('createdAt').toArray();
}

export async function createPlaylist(name: string, description: string = ''): Promise<Playlist> {
  const newPl: Playlist = {
    id: 'pl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: name.trim() || 'Untitled Playlist',
    description: description.trim(),
    createdAt: Date.now(),
    songIds: []
  };
  await db.playlists.add(newPl);
  return newPl;
}

export async function deletePlaylist(id: string): Promise<void> {
  await db.playlists.delete(id);
}

export async function updatePlaylist(id: string, updates: Partial<Playlist>): Promise<void> {
  await db.playlists.update(id, updates);
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  const pl = await db.playlists.get(playlistId);
  if (!pl) return;
  if (!pl.songIds.includes(songId)) {
    await db.playlists.update(playlistId, {
      songIds: [...pl.songIds, songId]
    });
  }
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  const pl = await db.playlists.get(playlistId);
  if (!pl) return;
  await db.playlists.update(playlistId, {
    songIds: pl.songIds.filter(id => id !== songId)
  });
}
