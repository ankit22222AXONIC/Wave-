import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Heart,
  Music
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/metadata';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleLikeCurrentSong,
    currentCoverUrl
  } = usePlayer();

  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-[80px] w-full bg-[#09090B] border-t border-[#27272A] px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Track Details */}
      <div className="flex items-center gap-3.5 w-[280px] min-w-0">
        {currentSong ? (
          <>
            <div className="w-12 h-12 rounded-md bg-[#1C1C21] border border-[#27272A] overflow-hidden shrink-0 flex items-center justify-center">
              {currentCoverUrl ? (
                <img
                  src={currentCoverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={20} className="text-[#71717A]" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-white truncate" title={currentSong.title}>
                {currentSong.title}
              </span>
              <span className="text-xs text-[#A1A1AA] truncate" title={currentSong.artist}>
                {currentSong.artist}
              </span>
            </div>

            <button
              onClick={toggleLikeCurrentSong}
              className={`p-1.5 rounded-full hover:bg-[#1C1C21] transition-colors shrink-0 ${
                currentSong.isLiked ? 'text-red-500' : 'text-[#71717A] hover:text-white'
              }`}
              title={currentSong.isLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={18}
                className={currentSong.isLiked ? 'fill-red-500 text-red-500' : ''}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#71717A]">
            <div className="w-12 h-12 rounded-md bg-[#1C1C21] border border-[#27272A] flex items-center justify-center">
              <Music size={20} className="text-[#3F3F46]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#71717A]">No track selected</span>
              <span className="text-[11px] text-[#3F3F46]">Pick a song to play</span>
            </div>
          </div>
        )}
      </div>

      {/* Centre: Controls & Timeline */}
      <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[620px] px-4">
        {/* Playback Buttons */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            disabled={!currentSong}
            className={`p-1.5 rounded transition-colors relative ${
              isShuffle ? 'text-white' : 'text-[#71717A] hover:text-white'
            } disabled:opacity-40 disabled:pointer-events-none`}
            title={isShuffle ? 'Shuffle enabled' : 'Enable shuffle'}
          >
            <Shuffle size={16} />
            {isShuffle && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={prevSong}
            disabled={!currentSong}
            className="text-[#A1A1AA] hover:text-white transition-colors p-1 disabled:opacity-40 disabled:pointer-events-none"
            title="Previous (or restart)"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          {/* Play / Pause button */}
          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextSong}
            disabled={!currentSong}
            className="text-[#A1A1AA] hover:text-white transition-colors p-1 disabled:opacity-40 disabled:pointer-events-none"
            title="Next"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            disabled={!currentSong}
            className={`p-1.5 rounded transition-colors relative ${
              repeatMode !== 'off' ? 'text-white' : 'text-[#71717A] hover:text-white'
            } disabled:opacity-40 disabled:pointer-events-none`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={16} />}
            {repeatMode === 'all' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
            )}
          </button>
        </div>

        {/* Progress Bar & Timestamps */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-[#A1A1AA] w-9 text-right select-none">
            {formatDuration(currentTime)}
          </span>

          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative flex-1 h-1.5 bg-[#27272A] rounded-full cursor-pointer group flex items-center py-1"
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-[#27272A] rounded-full" />
            {/* Active bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-[width] duration-75 group-hover:bg-white"
              style={{ width: `${currentPercent}%` }}
            />
            {/* Draggable handle knob */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${currentPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-[#A1A1AA] w-9 select-none">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume & Hi-Fi */}
      <div className="flex items-center justify-end gap-3 w-[240px]">
        {/* Audio format badge */}
        {currentSong && (
          <span className="hidden sm:inline-block text-[10px] font-mono text-[#71717A] border border-[#27272A] bg-[#121215] px-1.5 py-0.5 rounded uppercase">
            {currentSong.format}
          </span>
        )}

        {/* Volume Mute Toggle */}
        <button
          onClick={toggleMute}
          className="text-[#A1A1AA] hover:text-white transition-colors p-1"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX size={18} />
          ) : volume < 0.5 ? (
            <Volume1 size={18} />
          ) : (
            <Volume2 size={18} />
          )}
        </button>

        {/* Volume Slider */}
        <div className="w-24 flex items-center">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-white hover:accent-neutral-200"
          />
        </div>
      </div>
    </footer>
  );
};
