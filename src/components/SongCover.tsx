import React, { useEffect, useState } from 'react';
import { Music } from 'lucide-react';

interface SongCoverProps {
  coverBlob?: Blob;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export const SongCover: React.FC<SongCoverProps> = ({
  coverBlob,
  size = 'md',
  className = '',
  alt = 'Song Cover'
}) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!coverBlob) {
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverBlob);
    setImgUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [coverBlob]);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded',
    md: 'w-10 h-10 rounded-md',
    lg: 'w-12 h-12 rounded-lg',
    xl: 'w-36 h-36 rounded-xl'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
    xl: 56
  };

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={alt}
        className={`object-cover shrink-0 select-none bg-[#1C1C21] ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center bg-[#1C1C21] border border-[#27272A] text-[#71717A] select-none ${sizeClasses[size]} ${className}`}
    >
      <Music size={iconSizes[size]} strokeWidth={1.75} />
    </div>
  );
};
