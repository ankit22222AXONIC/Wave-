import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Shuffle, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ListMusic, 
  Music 
} from 'lucide-react';
import type { Song, Playlist } from '../types';
import { TrackTable } from '../components/TrackTable';
import { SongCover } from '../components/SongCover';
import { usePlayer } from '../context/PlayerContext';
import { AddSongsToPlaylistModal } from '../components/AddSongsToPlaylistModal';

interface PlaylistPageProps {
  playlist: Playlist;
  allSongs: Song[];
  onToggleLike: (songId: string) => void;
  onDeleteSong: (songId: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onRemoveFromPlaylist: (playlistId: string, songId: string) => void;
  onAddSongToPlaylist: (playlistId: string, songId: string) => void;
  onRenamePlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (id: string) => void;
}

export const PlaylistPage: React.FC<PlaylistPageProps> = ({
  playlist,
  allSongs,
  onToggleLike,
  onDeleteSong,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onAddSongToPlaylist,
  onRenamePlaylist,
  onDeletePlaylist
}) => {
  const { playAll } = usePlayer();
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Ordered songs in this playlist
  const playlistSongs = playlist.songIds
    .map(id => allSongs.find(s => s.id === id))
    .filter((s): s is Song => s !== undefined);

  const totalDuration = playlistSongs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalMins = Math.floor(totalDuration / 60);
  const totalSecs = Math.floor(totalDuration % 60);
  const durationText = totalMins > 0 ? `${totalMins} min ${totalSecs} sec` : `${totalSecs} sec`;

  // Collage of covers (up to 4)
  const topCovers = playlistSongs.slice(0, 4);

  return (
    <div className="flex flex-col w-full p-8 max-w-7xl mx-auto gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-6 border-b border-[#27272A]/40 relative">
        {/* 140x140px Cover */}
        <div className="w-[140px] h-[140px] rounded-xl bg-[#1C1C21] border border-[#27272A] overflow-hidden shrink-0 shadow-lg flex items-center justify-center">
          {topCovers.length >= 4 ? (
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
              {topCovers.map((s, idx) => (
                <div key={idx} className="w-full h-full border-[0.5px] border-[#09090B]">
                  <SongCover coverBlob={s.coverBlob} size="lg" className="w-full h-full rounded-none" />
                </div>
              ))}
            </div>
          ) : topCovers.length > 0 && topCovers[0].coverBlob ? (
            <SongCover coverBlob={topCovers[0].coverBlob} size="xl" className="w-full h-full rounded-xl" />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#71717A]">
              <ListMusic size={44} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="text-xs uppercase font-mono tracking-widest text-[#71717A]">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white truncate" title={playlist.name}>
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs text-[#A1A1AA] line-clamp-2 max-w-2xl">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <span>{playlistSongs.length} {playlistSongs.length === 1 ? 'song' : 'songs'}</span>
            {playlistSongs.length > 0 && (
              <>
                <span>•</span>
                <span>{durationText}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Menu (Rename / Delete) */}
        <div className="relative self-start sm:self-end" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="p-2 text-[#71717A] hover:text-white rounded-lg hover:bg-[#1C1C21] transition-colors"
            title="Playlist options"
          >
            <MoreHorizontal size={20} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-10 w-44 bg-[#1C1C21] border border-[#27272A] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#A1A1AA]">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onRenamePlaylist(playlist);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-[#27272A] hover:text-white transition-colors"
              >
                <Edit2 size={13} />
                <span>Rename Playlist</span>
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeletePlaylist(playlist.id);
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Playlist</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {playlistSongs.length > 0 && (
          <>
            <button
              onClick={() => playAll(playlistSongs, false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold text-sm rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              <span>Play</span>
            </button>
            <button
              onClick={() => playAll(playlistSongs, true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </>
        )}
        <button
          onClick={() => setIsAddSongsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] font-medium text-sm rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Songs</span>
        </button>
      </div>

      {/* Playlist Tracks */}
      {playlistSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-[#71717A] mb-3">
            <Music size={24} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            This playlist is empty
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm mb-5">
            Add tracks from your music library to this playlist to build your customized soundtrack.
          </p>
          <button
            onClick={() => setIsAddSongsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Songs Now</span>
          </button>
        </div>
      ) : (
        <TrackTable
          songs={playlistSongs}
          onToggleLike={onToggleLike}
          onDeleteSong={onDeleteSong}
          onAddToPlaylist={onAddToPlaylist}
          onRemoveFromPlaylist={(songId) => onRemoveFromPlaylist(playlist.id, songId)}
          playlistContextName={playlist.name}
        />
      )}

      {/* Add Songs Modal */}
      <AddSongsToPlaylistModal
        isOpen={isAddSongsOpen}
        onClose={() => setIsAddSongsOpen(false)}
        playlist={playlist}
        allSongs={allSongs}
        onAddSong={onAddSongToPlaylist}
        onRemoveSong={onRemoveFromPlaylist}
      />
    </div>
  );
};
