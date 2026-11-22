import React from 'react';

export const EqualizerIcon: React.FC<{ isPlaying?: boolean }> = ({ isPlaying = true }) => {
  return (
    <div className="flex items-end justify-center gap-[2px] w-4 h-4" title="Playing">
      <span
        className={`w-[3px] bg-white rounded-full ${
          isPlaying ? 'animate-equalizer-1' : 'h-[6px]'
        }`}
        style={{ height: isPlaying ? undefined : '6px' }}
      />
      <span
        className={`w-[3px] bg-white rounded-full ${
          isPlaying ? 'animate-equalizer-2' : 'h-[12px]'
        }`}
        style={{ height: isPlaying ? undefined : '12px' }}
      />
      <span
        className={`w-[3px] bg-white rounded-full ${
          isPlaying ? 'animate-equalizer-3' : 'h-[8px]'
        }`}
        style={{ height: isPlaying ? undefined : '8px' }}
      />
    </div>
  );
};
