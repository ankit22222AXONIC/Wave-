import React, { useState, useMemo } from 'react';
import { Search, X, Music, User, ListMusic } from 'lucide-react';
import type { Song, Playlist, ActivePage } from '../types';
import { TrackTable } from '../components/TrackTable';
import { usePlayer } from '../context/PlayerContext';

interface SearchPageProps {
  songs: Song[];
  playlists: Playlist[];
  onToggleLike: (songId: string) => void;
  onDeleteSong: (songId: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onNavigate: (page: ActivePage) => void;
}

type FilterTab = 'All' | 'Songs' | 'Artists' | 'Playlists';

export const SearchPage: React.FC<SearchPageProps> = ({
  songs,
  playlists,
  onToggleLike,
  onDeleteSong,
  onAddToPlaylist,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const { playSong } = usePlayer();

  const q = query.trim().toLowerCase();

  // Filtered Songs
  const filteredSongs = useMemo(() => {
    if (!q) return [];
    return songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.album && s.album.toLowerCase().includes(q))
    );
  }, [songs, q]);

  // Grouped / Filtered Artists
  const filteredArtists = useMemo(() => {
    if (!q) return [];
    const map = new Map<string, Song[]>();
    for (const song of songs) {
      if (song.artist.toLowerCase().includes(q)) {
        if (!map.has(song.artist)) {
          map.set(song.artist, []);
        }
        map.get(song.artist)!.push(song);
      }
    }
    return Array.from(map.entries()).map(([artist, artistSongs]) => ({
      artist,
      count: artistSongs.length,
      songs: artistSongs
    }));
  }, [songs, q]);

  // Filtered Playlists
  const filteredPlaylists = useMemo(() => {
    if (!q) return [];
    return playlists.filter(pl =>
      pl.name.toLowerCase().includes(q) ||
      (pl.description && pl.description.toLowerCase().includes(q))
    );
  }, [playlists, q]);

  const totalResults = filteredSongs.length + filteredArtists.length + filteredPlaylists.length;

  return (
    <div className="flex flex-col w-full p-8 max-w-7xl mx-auto gap-6">
      {/* Search Bar Input */}
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center w-full max-w-2xl bg-[#1C1C21] border border-[#27272A] focus-within:border-white rounded-xl px-4 h-12 shadow-sm transition-all">
          <Search size={18} className="text-[#A1A1AA] mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, playlists..."
            className="w-full bg-transparent text-white placeholder:text-[#71717A] text-sm outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors ml-2"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['All', 'Songs', 'Artists', 'Playlists'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#1C1C21] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results View */}
      {query.trim() === '' ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-[#71717A] mb-3">
            <Search size={24} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Search your music library
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm">
            Type track titles, artist names, or playlists to search instantly through your offline collection.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[#A1A1AA] mb-1">No results found for "{query}"</p>
          <p className="text-xs text-[#71717A]">
            Try checking spelling or uploading new music to your library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Artists Section */}
          {(activeTab === 'All' || activeTab === 'Artists') && filteredArtists.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#71717A]">
                Artists ({filteredArtists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredArtists.map(({ artist, count, songs: artistSongs }) => (
                  <div
                    key={artist}
                    onClick={() => {
                      if (artistSongs.length > 0) {
                        playSong(artistSongs[0], artistSongs, 0);
                      }
                    }}
                    className="flex flex-col items-center text-center p-4 bg-[#1C1C21]/60 hover:bg-[#1C1C21] border border-[#27272A] rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#121215] border border-[#27272A] flex items-center justify-center text-[#71717A] group-hover:text-white group-hover:border-white/40 mb-3 transition-colors">
                      <User size={24} />
                    </div>
                    <span className="text-sm font-medium text-white truncate w-full" title={artist}>
                      {artist}
                    </span>
                    <span className="text-xs text-[#71717A] mt-0.5">
                      {count} {count === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Section */}
          {(activeTab === 'All' || activeTab === 'Playlists') && filteredPlaylists.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#71717A]">
                Playlists ({filteredPlaylists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onNavigate({ type: 'playlist', playlistId: pl.id })}
                    className="flex items-center gap-3 p-3 bg-[#1C1C21]/60 hover:bg-[#1C1C21] border border-[#27272A] rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#121215] border border-[#27272A] flex items-center justify-center text-[#71717A] group-hover:text-white transition-colors shrink-0">
                      <ListMusic size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white truncate">{pl.name}</span>
                      <span className="text-xs text-[#71717A]">{pl.songIds.length} songs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Songs Section */}
          {(activeTab === 'All' || activeTab === 'Songs') && filteredSongs.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#71717A]">
                Songs ({filteredSongs.length})
              </h2>
              <TrackTable
                songs={filteredSongs}
                onToggleLike={onToggleLike}
                onDeleteSong={onDeleteSong}
                onAddToPlaylist={onAddToPlaylist}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
