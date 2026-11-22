import React, { useState } from 'react';
import { X, Search, Check, Plus, Music } from 'lucide-react';
import type { Song, Playlist } from '../types';
import { SongCover } from './SongCover';
import { formatDuration } from '../utils/metadata';

interface AddSongsToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  allSongs: Song[];
  onAddSong: (playlistId: string, songId: string) => void;
  onRemoveSong: (playlistId: string, songId: string) => void;
}

export const AddSongsToPlaylistModal: React.FC<AddSongsToPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlist,
  allSongs,
  onAddSong,
  onRemoveSong
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = allSongs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-xl bg-[#09090B] border border-[#27272A] rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-semibold text-white">Add Songs to Playlist</h2>
            <p className="text-xs text-[#A1A1AA]">Playlist: {playlist.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-[#1C1C21] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#27272A]">
          <div className="relative flex items-center w-full bg-[#121215] border border-[#27272A] rounded-lg px-3 h-10">
            <Search size={16} className="text-[#71717A] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library songs..."
              className="w-full bg-transparent text-white placeholder:text-[#71717A] text-xs outline-none"
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="p-4 flex flex-col gap-1.5 overflow-y-auto flex-1">
          {allSongs.length === 0 ? (
            <p className="text-xs text-[#71717A] text-center py-8">
              No songs in your library yet. Upload songs first!
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-[#71717A] text-center py-8">
              No songs match "{search}"
            </p>
          ) : (
            filtered.map((song) => {
              const isIncluded = playlist.songIds.includes(song.id);
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1C1C21] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SongCover coverBlob={song.coverBlob} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-white truncate">{song.title}</span>
                      <span className="text-[11px] text-[#A1A1AA] truncate">{song.artist}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-[#71717A]">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      onClick={() => {
                        if (isIncluded) {
                          onRemoveSong(playlist.id, song.id);
                        } else {
                          onAddSong(playlist.id, song.id);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        isIncluded
                          ? 'bg-[#1C1C21] text-white border border-white/20 hover:border-red-500 hover:text-red-400'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                    >
                      {isIncluded ? (
                        <>
                          <Check size={12} strokeWidth={2.5} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={12} strokeWidth={2.5} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#27272A] flex justify-end bg-[#09090B]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
