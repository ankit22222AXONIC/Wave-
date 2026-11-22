import React from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  Upload, 
  Plus, 
  ListMusic, 
  Trash2,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import type { ActivePage, Playlist } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenUpload: () => void;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  onDeletePlaylist: (id: string, e: React.MouseEvent) => void;
  likedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  onOpenUpload,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  likedCount
}) => {
  const { user, displayName, logout } = useAuth();

  return (
    <aside className="w-[240px] shrink-0 h-full bg-[#09090B] border-r border-[#27272A] flex flex-col justify-between select-none z-20">
      <div className="flex flex-col p-4 gap-5 overflow-hidden flex-1 min-h-0">
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate({ type: 'home' })}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v4" />
              <path d="M6 7v10" />
              <path d="M10 3v18" />
              <path d="M14 6v12" />
              <path d="M18 8v8" />
              <path d="M22 10v4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Wave</span>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage.type === 'home'
                ? 'bg-[#1C1C21] text-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1C1C21]/50'
            }`}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'search' })}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage.type === 'search'
                ? 'bg-[#1C1C21] text-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1C1C21]/50'
            }`}
          >
            <Search size={18} />
            <span>Search</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'liked' })}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePage.type === 'liked'
                ? 'bg-[#1C1C21] text-white font-semibold'
                : 'text-[#A1A1AA] hover:text-white hover:bg-[#1C1C21]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Heart 
                size={18} 
                className={activePage.type === 'liked' ? 'text-red-500 fill-red-500' : ''} 
              />
              <span>Liked Songs</span>
            </div>
            {likedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1C1C21] text-[#A1A1AA]">
                {likedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Upload Song Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Upload size={16} strokeWidth={2.5} />
          <span>Upload Song</span>
        </button>

        {/* Thin Divider */}
        <div className="h-[1px] bg-[#27272A] w-full shrink-0" />

        {/* Playlists Section */}
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <div className="flex items-center justify-between px-2 text-[#71717A] shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider">Playlists</span>
            <button
              onClick={onCreatePlaylist}
              className="p-1 hover:text-white hover:bg-[#1C1C21] rounded transition-colors cursor-pointer"
              title="Create Playlist"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Playlist list scrollable */}
          <div className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1">
            {playlists.length === 0 ? (
              <p className="px-2 py-3 text-xs text-[#71717A] italic">
                No playlists yet. Click + to create one.
              </p>
            ) : (
              playlists.map(pl => {
                const isActive =
                  activePage.type === 'playlist' && activePage.playlistId === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => onNavigate({ type: 'playlist', playlistId: pl.id })}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#1C1C21] text-white font-semibold'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#1C1C21]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ListMusic size={16} className="shrink-0 text-[#71717A] group-hover:text-white" />
                      <span className="truncate">{pl.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#71717A] group-hover:hidden">
                        {pl.songIds.length}
                      </span>
                      <button
                        onClick={(e) => onDeletePlaylist(pl.id, e)}
                        title="Delete playlist"
                        className="hidden group-hover:block p-1 text-[#71717A] hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Profile Footer: User saved name, Gmail & Log Out button */}
      <div className="p-3 border-t border-[#27272A] flex items-center justify-between text-xs bg-[#09090B] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <div className="w-8 h-8 rounded-full bg-[#1C1C21] border border-[#27272A] shrink-0 overflow-hidden flex items-center justify-center text-white">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={14} className="text-[#A1A1AA]" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate leading-tight" title={displayName || 'User'}>
              {displayName || user?.displayName || 'User'}
            </span>
            <span className="text-[11px] text-[#A1A1AA] truncate leading-tight" title={user?.email || ''}>
              {user?.email || 'Offline user'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-[#71717A] hover:text-white hover:bg-[#1C1C21] rounded-lg transition-colors shrink-0"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
