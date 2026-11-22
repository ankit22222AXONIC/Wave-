import React from 'react';
import { Play, Shuffle, UploadCloud, Music } from 'lucide-react';
import type { Song } from '../types';
import { TrackTable } from '../components/TrackTable';
import { usePlayer } from '../context/PlayerContext';

interface HomePageProps {
  songs: Song[];
  onToggleLike: (songId: string) => void;
  onDeleteSong: (songId: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onOpenUpload: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  songs,
  onToggleLike,
  onDeleteSong,
  onAddToPlaylist,
  onOpenUpload
}) => {
  const { playAll } = usePlayer();

  return (
    <div className="flex flex-col w-full p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#27272A]/40 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#71717A]">
            <span>Library</span>
            <span>/</span>
            <span>Collection</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">All Songs</h1>
          <p className="text-sm text-[#A1A1AA]">
            {songs.length} {songs.length === 1 ? 'song' : 'songs'} in your local browser library
          </p>
        </div>

        {/* Action Buttons */}
        {songs.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => playAll(songs, false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold text-sm rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              <span>Play All</span>
            </button>
            <button
              onClick={() => playAll(songs, true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] font-medium text-sm rounded-lg transition-colors cursor-pointer"
              title="Shuffle All"
            >
              <Shuffle size={16} />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table or Empty State */}
      {songs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div 
            onClick={onOpenUpload}
            className="w-full max-w-xl border-2 border-dashed border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-[#121215]/50 hover:bg-[#1C1C21]/30 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud size={28} className="text-[#A1A1AA] group-hover:text-white transition-colors" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-1.5">
              No songs uploaded yet
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-md mb-6 leading-relaxed">
              Your library is stored privately and locally in your browser's IndexedDB. 
              Drag and drop audio files here or click below to start streaming.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenUpload();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold text-sm rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Music size={16} />
              <span>Browse Audio Files</span>
            </button>

            <span className="text-[11px] text-[#71717A] mt-4 font-mono">
              MP3, WAV, FLAC, M4A, OGG
            </span>
          </div>
        </div>
      ) : (
        <TrackTable
          songs={songs}
          onToggleLike={onToggleLike}
          onDeleteSong={onDeleteSong}
          onAddToPlaylist={onAddToPlaylist}
        />
      )}
    </div>
  );
};
