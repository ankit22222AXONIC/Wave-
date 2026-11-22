import React from 'react';
import { Heart, Play, Shuffle, Music } from 'lucide-react';
import type { Song } from '../types';
import { TrackTable } from '../components/TrackTable';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/metadata';

interface LikedSongsPageProps {
  songs: Song[];
  onToggleLike: (songId: string) => void;
  onDeleteSong: (songId: string) => void;
  onAddToPlaylist: (song: Song) => void;
  onNavigateHome: () => void;
}

export const LikedSongsPage: React.FC<LikedSongsPageProps> = ({
  songs,
  onToggleLike,
  onDeleteSong,
  onAddToPlaylist,
  onNavigateHome
}) => {
  const { playAll } = usePlayer();
  const likedSongs = songs.filter(s => s.isLiked);

  const totalDurationSeconds = likedSongs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalMins = Math.floor(totalDurationSeconds / 60);
  const totalSecs = Math.floor(totalDurationSeconds % 60);
  const durationText = totalMins > 0 ? `${totalMins} min ${totalSecs} sec` : `${totalSecs} sec`;

  return (
    <div className="flex flex-col w-full p-8 max-w-7xl mx-auto gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-6 border-b border-[#27272A]/40">
        {/* 140x140px dark gray square with white heart */}
        <div className="w-[140px] h-[140px] rounded-xl bg-[#1C1C21] border border-[#27272A] flex items-center justify-center shrink-0 shadow-lg">
          <Heart size={54} className="text-white fill-white" />
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs uppercase font-mono tracking-widest text-[#71717A]">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <span>{likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}</span>
            {likedSongs.length > 0 && (
              <>
                <span>•</span>
                <span>{durationText}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {likedSongs.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => playAll(likedSongs, false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-semibold text-sm rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            <span>Play</span>
          </button>
          <button
            onClick={() => playAll(likedSongs, true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            <Shuffle size={16} />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Track List */}
      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-[#71717A] mb-3">
            <Heart size={24} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            Songs you like will appear here
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm mb-5">
            Save your favorite tracks by clicking the heart icon on any song in your library or player.
          </p>
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1C21] hover:bg-[#27272A] text-white border border-[#27272A] rounded-lg text-xs font-semibold transition-colors"
          >
            <Music size={14} />
            <span>Go to All Songs</span>
          </button>
        </div>
      ) : (
        <TrackTable
          songs={likedSongs}
          onToggleLike={onToggleLike}
          onDeleteSong={onDeleteSong}
          onAddToPlaylist={onAddToPlaylist}
        />
      )}
    </div>
  );
};
