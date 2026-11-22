import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Clock, 
  Trash2, 
  PlusCircle, 
  FolderMinus 
} from 'lucide-react';
import type { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { SongCover } from './SongCover';
import { EqualizerIcon } from './EqualizerIcon';
import { formatDuration, formatTimeAgo } from '../utils/metadata';

interface TrackTableProps {
  songs: Song[];
  onToggleLike: (songId: string) => void;
  onDeleteSong?: (songId: string) => void;
  onAddToPlaylist?: (song: Song) => void;
  onRemoveFromPlaylist?: (songId: string) => void;
  playlistContextName?: string;
}

export const TrackTable: React.FC<TrackTableProps> = ({
  songs,
  onToggleLike,
  onDeleteSong,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuSongId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRowClick = (song: Song, index: number) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, songs, index);
    }
  };

  return (
    <div className="w-full text-left select-none relative">
      {/* Header Row */}
      <div className="grid grid-cols-[40px_1fr_140px_80px_70px] items-center px-4 py-2 border-b border-[#27272A] text-xs font-medium text-[#71717A] tracking-wider uppercase">
        <div className="text-center">#</div>
        <div>Title</div>
        <div className="hidden sm:block">Date Added</div>
        <div className="flex items-center gap-1">
          <Clock size={13} />
          <span>Time</span>
        </div>
        <div className="text-right pr-2">Actions</div>
      </div>

      {/* Song Rows */}
      <div className="flex flex-col divide-y divide-[#27272A]/30">
        {songs.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;
          const isMenuOpen = activeMenuSongId === song.id;

          return (
            <div
              key={song.id}
              onDoubleClick={() => handleRowClick(song, idx)}
              className={`group grid grid-cols-[40px_1fr_140px_80px_70px] items-center px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#1C1C21] text-white'
                  : 'hover:bg-[#1C1C21]/60 text-[#A1A1AA]'
              }`}
            >
              {/* # or Play button or Equalizer */}
              <div 
                className="flex items-center justify-center h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(song, idx);
                }}
              >
                {isCurrent ? (
                  <div className="relative flex items-center justify-center">
                    <span className="group-hover:hidden">
                      <EqualizerIcon isPlaying={isPlaying} />
                    </span>
                    <button
                      className="hidden group-hover:flex items-center justify-center text-white"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <span className="text-xs font-mono text-[#71717A] group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      className="hidden group-hover:flex items-center justify-center text-white"
                      title="Play"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Artist & Cover */}
              <div 
                className="flex items-center gap-3 min-w-0 pr-4"
                onClick={() => handleRowClick(song, idx)}
              >
                <SongCover coverBlob={song.coverBlob} size="md" />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-medium truncate ${
                      isCurrent ? 'text-white font-semibold' : 'text-white'
                    }`}
                  >
                    {song.title}
                  </span>
                  <span className="text-xs text-[#A1A1AA] truncate">
                    {song.artist}
                  </span>
                </div>
              </div>

              {/* Date Added */}
              <div className="hidden sm:block text-xs text-[#71717A] truncate">
                {formatTimeAgo(song.dateAdded)}
              </div>

              {/* Duration */}
              <div className="text-xs font-mono text-[#71717A]">
                {formatDuration(song.duration)}
              </div>

              {/* Heart and Menu Actions */}
              <div className="flex items-center justify-end gap-1 relative">
                {/* Heart toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(song.id);
                  }}
                  className={`p-1.5 rounded hover:bg-[#27272A] transition-colors ${
                    song.isLiked
                      ? 'text-red-500'
                      : 'text-[#71717A] opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                  title={song.isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    size={15}
                    className={song.isLiked ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>

                {/* More Menu Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuSongId(isMenuOpen ? null : song.id);
                  }}
                  className={`p-1.5 rounded hover:bg-[#27272A] text-[#71717A] hover:text-white transition-colors ${
                    isMenuOpen ? 'opacity-100 bg-[#27272A]' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="More actions"
                >
                  <MoreHorizontal size={15} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-8 w-48 bg-[#1C1C21] border border-[#27272A] rounded-lg shadow-2xl py-1 z-50 text-xs text-[#A1A1AA]"
                  >
                    {onAddToPlaylist && (
                      <button
                        onClick={() => {
                          setActiveMenuSongId(null);
                          onAddToPlaylist(song);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-[#27272A] hover:text-white transition-colors"
                      >
                        <PlusCircle size={14} />
                        <span>Add to Playlist...</span>
                      </button>
                    )}

                    {onRemoveFromPlaylist && (
                      <button
                        onClick={() => {
                          setActiveMenuSongId(null);
                          onRemoveFromPlaylist(song.id);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-[#27272A] hover:text-white transition-colors text-yellow-500/90"
                      >
                        <FolderMinus size={14} />
                        <span>Remove from Playlist</span>
                      </button>
                    )}

                    {onDeleteSong && (
                      <button
                        onClick={() => {
                          setActiveMenuSongId(null);
                          onDeleteSong(song.id);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-red-500/20 hover:text-red-400 text-red-400/90 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete from Library</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
