import React, { useState } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import type { Song, Playlist } from '../types';

interface AddToPlaylistModalProps {
  song: Song | null;
  playlists: Playlist[];
  onClose: () => void;
  onToggleInPlaylist: (playlistId: string, songId: string) => void;
  onCreateNewPlaylist: (name: string) => Promise<void>;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  song,
  playlists,
  onClose,
  onToggleInPlaylist,
  onCreateNewPlaylist
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!song) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    try {
      await onCreateNewPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-[#09090B] border border-[#27272A] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-white">Add to Playlist</h2>
            <span className="text-xs text-[#A1A1AA] truncate max-w-[300px]">
              "{song.title}" by {song.artist}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-[#1C1C21] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {/* Create new playlist inline */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="flex-1 bg-[#121215] border border-[#27272A] focus:border-white text-white text-xs rounded-lg px-3 py-2 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim() || isCreating}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus size={14} />
              <span>Create</span>
            </button>
          </form>

          {/* List of playlists */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
              Your Playlists
            </span>

            {playlists.length === 0 ? (
              <p className="text-xs text-[#71717A] italic py-2">
                No playlists yet. Type a name above to create one.
              </p>
            ) : (
              playlists.map((pl) => {
                const isInPlaylist = pl.songIds.includes(song.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => onToggleInPlaylist(pl.id, song.id)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#121215] hover:bg-[#1C1C21] border border-[#27272A] transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-[#71717A]">
                        <ListMusic size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">{pl.name}</span>
                        <span className="text-[11px] text-[#71717A]">{pl.songIds.length} songs</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                        isInPlaylist
                          ? 'bg-white border-white text-black'
                          : 'border-[#3F3F46] group-hover:border-white'
                      }`}
                    >
                      {isInPlaylist && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
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
