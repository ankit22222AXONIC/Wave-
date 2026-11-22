export interface ExtractedMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverBlob?: Blob;
  format: string;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function cleanFilename(name: string): { title: string; artist: string } {
  // Strip extension
  const withoutExt = name.replace(/\.[^/.]+$/, '').trim();

  // If filename looks like "Artist - Title" or "Artist _ Title"
  const dashMatch = withoutExt.match(/^([^-–—_]+)\s*[-–—_]\s*(.+)$/);
  if (dashMatch) {
    const artist = dashMatch[1].trim();
    const title = dashMatch[2].trim();
    return {
      artist: artist || 'Unknown Artist',
      title: title || 'Untitled Track'
    };
  }

  // Replace underscores or dots with spaces
  const cleaned = withoutExt.replace(/[._+]/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    artist: 'Unknown Artist',
    title: cleaned || 'Untitled Track'
  };
}

/**
 * Robust lightweight parser for ID3v2 tags (TIT2, TPE1, TALB, APIC)
 */
function parseID3v2(buffer: ArrayBuffer): { title?: string; artist?: string; album?: string; coverBlob?: Blob } {
  const result: { title?: string; artist?: string; album?: string; coverBlob?: Blob } = {};
  const view = new DataView(buffer);

  if (view.byteLength < 10) return result;

  // Check ID3 signature
  if (
    view.getUint8(0) !== 0x49 || // 'I'
    view.getUint8(1) !== 0x44 || // 'D'
    view.getUint8(2) !== 0x33    // '3'
  ) {
    return result;
  }

  const version = view.getUint8(3); // e.g. 3 for ID3v2.3, 4 for ID3v2.4
  // Tag size is stored as 4 synchsafe bytes (7 bits per byte)
  const tagSize =
    ((view.getUint8(6) & 0x7f) << 21) |
    ((view.getUint8(7) & 0x7f) << 14) |
    ((view.getUint8(8) & 0x7f) << 7) |
    (view.getUint8(9) & 0x7f);

  let offset = 10;
  const maxOffset = Math.min(view.byteLength, 10 + tagSize);

  const decoderUtf8 = new TextDecoder('utf-8');
  const decoderIso = new TextDecoder('iso-8859-1');
  const decoderUtf16le = new TextDecoder('utf-16le');

  const decodeText = (bytes: Uint8Array): string => {
    if (bytes.length === 0) return '';
    const encoding = bytes[0];
    const data = bytes.subarray(1);

    try {
      if (encoding === 0) {
        return decoderIso.decode(data).replace(/\0+$/, '').trim();
      } else if (encoding === 1) {
        return decoderUtf16le.decode(data).replace(/\0+$/, '').trim();
      } else if (encoding === 3) {
        return decoderUtf8.decode(data).replace(/\0+$/, '').trim();
      } else {
        return decoderUtf8.decode(data).replace(/\0+$/, '').trim();
      }
    } catch {
      return '';
    }
  };

  while (offset + 10 <= maxOffset) {
    // Frame ID (4 bytes)
    let frameId = '';
    for (let i = 0; i < 4; i++) {
      frameId += String.fromCharCode(view.getUint8(offset + i));
    }

    if (!frameId.match(/^[A-Z0-9]{4}$/)) {
      break;
    }

    let frameSize = 0;
    if (version === 4) {
      // synchsafe int in v2.4
      frameSize =
        ((view.getUint8(offset + 4) & 0x7f) << 21) |
        ((view.getUint8(offset + 5) & 0x7f) << 14) |
        ((view.getUint8(offset + 6) & 0x7f) << 7) |
        (view.getUint8(offset + 7) & 0x7f);
    } else {
      frameSize = view.getUint32(offset + 4);
    }

    if (frameSize <= 0 || offset + 10 + frameSize > maxOffset) {
      break;
    }

    const frameData = new Uint8Array(buffer, offset + 10, frameSize);

    if (frameId === 'TIT2' && !result.title) {
      result.title = decodeText(frameData);
    } else if (frameId === 'TPE1' && !result.artist) {
      result.artist = decodeText(frameData);
    } else if (frameId === 'TALB' && !result.album) {
      result.album = decodeText(frameData);
    } else if (frameId === 'APIC' && !result.coverBlob) {
      // APIC: [encoding 1 byte] [mime null-terminated] [picture type 1 byte] [description null-terminated] [picture data]
      try {
        let p = 1;
        let mime = '';
        while (p < frameData.length && frameData[p] !== 0) {
          mime += String.fromCharCode(frameData[p]);
          p++;
        }
        p++; // skip null terminator
        if (!mime) mime = 'image/jpeg';
        if (p < frameData.length) {
          p++; // skip picture type
        }
        // skip description (null-terminated)
        while (p < frameData.length && frameData[p] !== 0) {
          p++;
        }
        p++; // skip description null terminator
        if (p < frameData.length && frameData[p] === 0) p++; // extra null for utf-16

        if (p < frameData.length) {
          const imgBytes = frameData.slice(p);
          result.coverBlob = new Blob([imgBytes], { type: mime });
        }
      } catch (err) {
        console.warn('Could not parse APIC cover:', err);
      }
    }

    offset += 10 + frameSize;
  }

  return result;
}

/**
 * Gets exact duration in seconds from audio file
 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const dur = audio.duration;
      cleanUp();
      resolve(isFinite(dur) && dur > 0 ? dur : 0);
    };

    const onError = () => {
      cleanUp();
      resolve(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = objectUrl;

    // Timeout fallback after 3 seconds
    setTimeout(() => {
      cleanUp();
      resolve(0);
    }, 3000);
  });
}

/**
 * Extracts complete metadata from an uploaded audio file
 */
export async function extractAudioMetadata(file: File): Promise<ExtractedMetadata> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'mp3';
  const fallback = cleanFilename(file.name);

  let title = fallback.title;
  let artist = fallback.artist;
  let album = '';
  let coverBlob: Blob | undefined = undefined;

  try {
    // Read first 512KB for ID3 tags
    const slice = file.slice(0, 512 * 1024);
    const arrayBuffer = await slice.arrayBuffer();
    const id3 = parseID3v2(arrayBuffer);

    if (id3.title && id3.title.trim()) title = id3.title.trim();
    if (id3.artist && id3.artist.trim()) artist = id3.artist.trim();
    if (id3.album && id3.album.trim()) album = id3.album.trim();
    if (id3.coverBlob) coverBlob = id3.coverBlob;
  } catch (err) {
    console.warn('Metadata tag reading skipped:', err);
  }

  const duration = await getAudioDuration(file);

  return {
    title,
    artist,
    album,
    duration,
    coverBlob,
    format: extension.toUpperCase()
  };
}

/**
 * Generates a sleek dark placeholder image Blob if cover is not provided
 */
export function createPlaceholderCoverSvg(title: string, artist: string): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#1C1C21" />
    <circle cx="150" cy="150" r="100" fill="#121215" stroke="#27272A" stroke-width="2" />
    <circle cx="150" cy="150" r="32" fill="#09090B" stroke="#3F3F46" stroke-width="2" />
    <circle cx="150" cy="150" r="8" fill="#FFFFFF" />
    <path d="M125 180 L125 120 L175 110 L175 170" fill="none" stroke="#71717A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="115" cy="180" r="10" fill="#71717A"/>
    <circle cx="165" cy="170" r="10" fill="#71717A"/>
  </svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}
