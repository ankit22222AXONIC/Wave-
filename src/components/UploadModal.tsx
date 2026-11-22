import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import type { Song } from '../types';
import { extractAudioMetadata, formatDuration } from '../utils/metadata';
import { addMultipleSongs } from '../db';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newSongs: Song[]) => void;
  userId?: string;
}

const MAX_FILE_SIZE_BYTES = 60 * 1024 * 1024; // 60MB limit per track
const MAX_BATCH_FILES = 20; // 20 files per batch

interface PendingTrack {
  id: string;
  file: File;
  title: string;
  artist: string;
  duration: number;
  coverBlob?: Blob;
  coverPreviewUrl?: string;
  format: string;
  fileSize: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  userId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingTracks, setPendingTracks] = useState<PendingTrack[]>([]);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    setUploadWarning(null);
    const validExtensions = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];
    
    if (files.length > MAX_BATCH_FILES) {
      setUploadWarning(`Batch limit exceeded. Processing the first ${MAX_BATCH_FILES} files.`);
      files = files.slice(0, MAX_BATCH_FILES);
    }

    const audioFiles: File[] = [];
    const oversizedFiles: string[] = [];

    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) continue;

      if (f.size > MAX_FILE_SIZE_BYTES) {
        oversizedFiles.push(`${f.name} (${Math.round(f.size / 1024 / 1024)}MB)`);
      } else {
        audioFiles.push(f);
      }
    }

    if (oversizedFiles.length > 0) {
      setUploadWarning(`Skipped files over 60MB limit: ${oversizedFiles.join(', ')}`);
    }

    if (audioFiles.length === 0) {
      if (oversizedFiles.length === 0) {
        alert('Please select audio files (.mp3, .wav, .m4a, .ogg, .flac)');
      }
      return;
    }

    setIsProcessing(true);
    const newItems: PendingTrack[] = [];

    for (const file of audioFiles) {
      try {
        const meta = await extractAudioMetadata(file);
        let previewUrl: string | undefined = undefined;
        if (meta.coverBlob) {
          previewUrl = URL.createObjectURL(meta.coverBlob);
        }

        newItems.push({
          id: 'song_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          file,
          title: meta.title,
          artist: meta.artist,
          duration: meta.duration,
          coverBlob: meta.coverBlob,
          coverPreviewUrl: previewUrl,
          format: meta.format,
          fileSize: file.size
        });
      } catch (err) {
        console.error('Failed processing file:', file.name, err);
      }
    }

    setPendingTracks(prev => [...prev, ...newItems]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setPendingTracks(prev =>
      prev.map(t => (t.id === id ? { ...t, title: newTitle } : t))
    );
  };

  const handleArtistChange = (id: string, newArtist: string) => {
    setPendingTracks(prev =>
      prev.map(t => (t.id === id ? { ...t, artist: newArtist } : t))
    );
  };

  const handleCustomCover = (id: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPendingTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          if (t.coverPreviewUrl) URL.revokeObjectURL(t.coverPreviewUrl);
          return { ...t, coverBlob: file, coverPreviewUrl: previewUrl };
        }
        return t;
      })
    );
  };

  const handleRemoveTrack = (id: string) => {
    setPendingTracks(prev => {
      const target = prev.find(t => t.id === id);
      if (target?.coverPreviewUrl) {
        URL.revokeObjectURL(target.coverPreviewUrl);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  const handleSaveAll = async () => {
    if (pendingTracks.length === 0) return;
    setIsSaving(true);

    try {
      const finalSongs: Song[] = pendingTracks.map(t => ({
        id: t.id,
        userId: userId || undefined,
        title: t.title.trim() || 'Untitled Track',
        artist: t.artist.trim() || 'Unknown Artist',
        duration: t.duration,
        dateAdded: Date.now(),
        audioBlob: t.file,
        coverBlob: t.coverBlob,
        isLiked: false,
        fileSize: t.fileSize,
        format: t.format
      }));

      await addMultipleSongs(finalSongs);

      // Clean preview urls
      pendingTracks.forEach(t => {
        if (t.coverPreviewUrl) URL.revokeObjectURL(t.coverPreviewUrl);
      });

      setPendingTracks([]);
      onUploadSuccess(finalSongs);
      onClose();
    } catch (err) {
      console.error('Error saving songs to IndexedDB:', err);
      alert('Failed to save songs to local database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Revoke any created preview URLs
    pendingTracks.forEach(t => {
      if (t.coverPreviewUrl) URL.revokeObjectURL(t.coverPreviewUrl);
    });
    setPendingTracks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-[#09090B] border border-[#27272A] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-white" />
            <h2 className="text-base font-semibold text-white">Upload Songs</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-[#1C1C21] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {uploadWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-lg">
              {uploadWarning}
            </div>
          )}
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
              isDragging
                ? 'border-white bg-[#1C1C21]'
                : 'border-[#27272A] hover:border-[#3F3F46] bg-[#121215]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp3,.wav,.m4a,.ogg,.flac,audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 rounded-full bg-[#1C1C21] border border-[#27272A] flex items-center justify-center text-white mb-3">
              <Upload size={20} />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Drag & drop audio files here, or <span className="underline underline-offset-4">browse</span>
            </p>
            <p className="text-xs text-[#71717A]">
              Supports MP3, WAV, M4A, OGG, FLAC (multiple files supported)
            </p>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#A1A1AA]">
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Extracting tags, duration, and embedded cover art...</span>
            </div>
          )}

          {/* Parsed Tracks List */}
          {pendingTracks.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#71717A] uppercase tracking-wider">
                <span>Selected Tracks ({pendingTracks.length})</span>
                <span>Edit Info Before Saving</span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                {pendingTracks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 bg-[#1C1C21] border border-[#27272A] rounded-lg"
                  >
                    {/* Cover art preview & upload custom */}
                    <label 
                      className="relative w-12 h-12 rounded bg-[#121215] border border-[#27272A] shrink-0 cursor-pointer group overflow-hidden flex items-center justify-center"
                      title="Click to change cover"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleCustomCover(t.id, e.target.files[0]);
                          }
                        }}
                      />
                      {t.coverPreviewUrl ? (
                        <img
                          src={t.coverPreviewUrl}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music size={18} className="text-[#71717A]" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <ImageIcon size={14} />
                      </div>
                    </label>

                    {/* Inputs for Title and Artist */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                      <div>
                        <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-0.5">Title</label>
                        <input
                          type="text"
                          value={t.title}
                          onChange={(e) => handleTitleChange(t.id, e.target.value)}
                          className="w-full bg-[#121215] border border-[#27272A] focus:border-white text-white text-xs rounded px-2.5 py-1.5 outline-none transition-colors"
                          placeholder="Song Title"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#71717A] uppercase font-mono mb-0.5">Artist</label>
                        <input
                          type="text"
                          value={t.artist}
                          onChange={(e) => handleArtistChange(t.id, e.target.value)}
                          className="w-full bg-[#121215] border border-[#27272A] focus:border-white text-white text-xs rounded px-2.5 py-1.5 outline-none transition-colors"
                          placeholder="Artist Name"
                        />
                      </div>
                    </div>

                    {/* Format & Duration */}
                    <div className="hidden sm:flex flex-col items-end text-right shrink-0 font-mono text-[11px] text-[#71717A]">
                      <span>{formatDuration(t.duration)}</span>
                      <span className="uppercase text-[10px]">{t.format}</span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveTrack(t.id)}
                      className="p-1.5 text-[#71717A] hover:text-red-400 rounded transition-colors shrink-0"
                      title="Remove from upload queue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#27272A] bg-[#09090B]">
          <span className="text-xs text-[#71717A]">
            {pendingTracks.length > 0
              ? `${pendingTracks.length} song${pendingTracks.length > 1 ? 's' : ''} ready to store in IndexedDB`
              : 'IndexedDB persistent browser storage'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={pendingTracks.length === 0 || isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save to Library</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
