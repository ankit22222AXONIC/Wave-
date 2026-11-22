import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { Song, RepeatMode } from '../types';
import { toggleSongLike } from '../db';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  queueIndex: number;
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  playAll: (songs: Song[], shuffle?: boolean) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleLikeCurrentSong: () => Promise<void>;
  currentCoverUrl: string | null;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

  // Single HTML5 Audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const currentCoverUrlRef = useRef<string | null>(null);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  repeatModeRef.current = repeatMode;
  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;
  const queueRef = useRef<Song[]>(queue);
  queueRef.current = queue;
  const queueIndexRef = useRef<number>(queueIndex);
  queueIndexRef.current = queueIndex;

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        triggerNextSong();
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      if (currentAudioUrlRef.current) {
        URL.revokeObjectURL(currentAudioUrlRef.current);
      }
      if (currentCoverUrlRef.current) {
        URL.revokeObjectURL(currentCoverUrlRef.current);
      }
    };
  }, []);

  // Global spacebar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable)
        ) {
          return; // Ignore if user is typing
        }
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Revoke and generate cover URL safely
  const updateCoverUrl = useCallback((coverBlob?: Blob) => {
    if (currentCoverUrlRef.current) {
      URL.revokeObjectURL(currentCoverUrlRef.current);
      currentCoverUrlRef.current = null;
    }
    if (coverBlob) {
      const url = URL.createObjectURL(coverBlob);
      currentCoverUrlRef.current = url;
      setCurrentCoverUrl(url);
    } else {
      setCurrentCoverUrl(null);
    }
  }, []);

  const playSong = useCallback((song: Song, newQueue?: Song[], index?: number) => {
    if (!audioRef.current) return;

    // Revoke previous audio ObjectURL
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }

    const audioUrl = URL.createObjectURL(song.audioBlob);
    currentAudioUrlRef.current = audioUrl;

    updateCoverUrl(song.coverBlob);
    setCurrentSong(song);

    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(index !== undefined ? index : newQueue.findIndex(s => s.id === song.id));
    } else {
      // If not in current queue, append or maintain
      const existingIdx = queueRef.current.findIndex(s => s.id === song.id);
      if (existingIdx !== -1) {
        setQueueIndex(existingIdx);
      } else {
        setQueue(prev => [...prev, song]);
        setQueueIndex(queueRef.current.length);
      }
    }

    audioRef.current.src = audioUrl;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setDuration(song.duration || 0);

    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Playback error or autoplay prevented:', err);
      setIsPlaying(false);
    });
  }, [updateCoverUrl]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [currentSong]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentSong]);

  const triggerNextSong = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;

    let nextIdx = queueIndexRef.current + 1;

    if (isShuffleRef.current) {
      if (q.length > 1) {
        let randIdx = Math.floor(Math.random() * q.length);
        while (randIdx === queueIndexRef.current && q.length > 1) {
          randIdx = Math.floor(Math.random() * q.length);
        }
        nextIdx = randIdx;
      } else {
        nextIdx = 0;
      }
    }

    if (nextIdx >= q.length) {
      if (repeatModeRef.current === 'all') {
        nextIdx = 0;
      } else {
        // Stop at end
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = q[nextIdx];
    if (nextTrack) {
      playSong(nextTrack, q, nextIdx);
    }
  }, [playSong]);

  const nextSong = useCallback(() => {
    triggerNextSong();
  }, [triggerNextSong]);

  const prevSong = useCallback(() => {
    if (!audioRef.current) return;
    // If played more than 3 seconds, restart current track
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const q = queueRef.current;
    if (q.length === 0) return;

    let prevIdx = queueIndexRef.current - 1;
    if (prevIdx < 0) {
      prevIdx = repeatModeRef.current === 'all' ? q.length - 1 : 0;
    }

    const prevTrack = q[prevIdx];
    if (prevTrack) {
      playSong(prevTrack, q, prevIdx);
    }
  }, [playSong]);

  const playAll = useCallback((songs: Song[], shuffle = false) => {
    if (songs.length === 0) return;
    const finalQueue = shuffle ? [...songs].sort(() => Math.random() - 0.5) : [...songs];
    setIsShuffle(shuffle);
    playSong(finalQueue[0], finalQueue, 0);
  }, [playSong]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume > 0 ? volume : 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleLikeCurrentSong = useCallback(async () => {
    if (!currentSong) return;
    const newLiked = await toggleSongLike(currentSong.id);
    setCurrentSong(prev => prev ? { ...prev, isLiked: newLiked } : null);
    setQueue(prev => prev.map(s => s.id === currentSong.id ? { ...s, isLiked: newLiked } : s));
  }, [currentSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        playSong,
        playAll,
        togglePlay,
        pause,
        resume,
        nextSong,
        prevSong,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        toggleLikeCurrentSong,
        currentCoverUrl
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
