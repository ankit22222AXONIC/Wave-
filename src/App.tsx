import React, { useState, useEffect, useCallback } from 'react';
import type { Song, Playlist, ActivePage } from './types';
import { 
  getAllSongs, 
  getAllPlaylists, 
  deleteSong, 
  toggleSongLike, 
  createPlaylist, 
  deletePlaylist, 
  updatePlaylist, 
  addSongToPlaylist, 
  removeSongFromPlaylist 
} from './db';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { LoginPage } from './pages/LoginPage';
import { NameSetupPage } from './pages/NameSetupPage';
import { UploadModal } from './components/UploadModal';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';

const MainAppContent: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>({ type: 'home' });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<Song | null>(null);
  const [playlistModalConfig, setPlaylistModalConfig] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    playlistId?: string;
    initialName?: string;
    initialDesc?: string;
  }>({ isOpen: false, isEdit: false });

  const { currentSong } = usePlayer();

  // Load songs & playlists from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [fetchedSongs, fetchedPlaylists] = await Promise.all([
        getAllSongs(),
        getAllPlaylists()
      ]);
      setSongs(fetchedSongs);
      setPlaylists(fetchedPlaylists);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Synchronize liked state if currentSong was liked in player bar
  useEffect(() => {
    if (currentSong) {
      setSongs(prev =>
        prev.map(s => (s.id === currentSong.id ? { ...s, isLiked: currentSong.isLiked } : s))
      );
    }
  }, [currentSong?.isLiked, currentSong?.id]);

  // Like toggle handler
  const handleToggleLike = async (songId: string) => {
    try {
      const newLiked = await toggleSongLike(songId);
      setSongs(prev =>
        prev.map(s => (s.id === songId ? { ...s, isLiked: newLiked } : s))
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Delete song from library
  const handleDeleteSong = async (songId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this track from your library?');
    if (!confirmed) return;
    try {
      await deleteSong(songId);
      setSongs(prev => prev.filter(s => s.id !== songId));
      setPlaylists(prev =>
        prev.map(pl => ({
          ...pl,
          songIds: pl.songIds.filter(id => id !== songId)
        }))
      );
    } catch (err) {
      console.error('Failed to delete song:', err);
    }
  };

  // Playlist actions
  const handleCreatePlaylistSubmit = async (name: string, description: string) => {
    try {
      if (playlistModalConfig.isEdit && playlistModalConfig.playlistId) {
        await updatePlaylist(playlistModalConfig.playlistId, {
          name,
          description
        });
        setPlaylists(prev =>
          prev.map(pl =>
            pl.id === playlistModalConfig.playlistId ? { ...pl, name, description } : pl
          )
        );
      } else {
        const newPl = await createPlaylist(name, description);
        setPlaylists(prev => [...prev, newPl]);
        setActivePage({ type: 'playlist', playlistId: newPl.id });
      }
    } catch (err) {
      console.error('Failed to save playlist:', err);
    }
  };

  const handleDeletePlaylist = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm('Delete this playlist? The songs will remain in your library.');
    if (!confirmed) return;
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(pl => pl.id !== id));
      if (activePage.type === 'playlist' && activePage.playlistId === id) {
        setActivePage({ type: 'home' });
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleToggleInPlaylist = async (playlistId: string, songId: string) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    if (pl.songIds.includes(songId)) {
      await removeSongFromPlaylist(playlistId, songId);
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId
            ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
            : p
        )
      );
    } else {
      await addSongToPlaylist(playlistId, songId);
      setPlaylists(prev =>
        prev.map(p =>
          p.id === playlistId ? { ...p, songIds: [...p.songIds, songId] } : p
        )
      );
    }
  };

  const handleAddSongToPlaylist = async (playlistId: string, songId: string) => {
    await addSongToPlaylist(playlistId, songId);
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId ? { ...p, songIds: [...p.songIds, songId] } : p
      )
    );
  };

  const handleRemoveFromPlaylist = async (playlistId: string, songId: string) => {
    await removeSongFromPlaylist(playlistId, songId);
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId
          ? { ...p, songIds: p.songIds.filter(id => id !== songId) }
          : p
      )
    );
  };

  const handleUploadSuccess = (newSongs: Song[]) => {
    setSongs(prev => [...newSongs, ...prev]);
  };

  const likedCount = songs.filter(s => s.isLiked).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090B]">
      {/* 3-Part Desktop Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar (240px fixed) */}
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onOpenUpload={() => setIsUploadOpen(true)}
          playlists={playlists}
          onCreatePlaylist={() =>
            setPlaylistModalConfig({
              isOpen: true,
              isEdit: false,
              initialName: '',
              initialDesc: ''
            })
          }
          onDeletePlaylist={handleDeletePlaylist}
          likedCount={likedCount}
        />

        {/* Main Content Area (Scrollable middle, #121215) */}
        <main className="flex-1 overflow-y-auto bg-[#121215] text-white">
          {activePage.type === 'home' && (
            <HomePage
              songs={songs}
              onToggleLike={handleToggleLike}
              onDeleteSong={handleDeleteSong}
              onAddToPlaylist={setSongToAddToPlaylist}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {activePage.type === 'search' && (
            <SearchPage
              songs={songs}
              playlists={playlists}
              onToggleLike={handleToggleLike}
              onDeleteSong={handleDeleteSong}
              onAddToPlaylist={setSongToAddToPlaylist}
              onNavigate={setActivePage}
            />
          )}

          {activePage.type === 'liked' && (
            <LikedSongsPage
              songs={songs}
              onToggleLike={handleToggleLike}
              onDeleteSong={handleDeleteSong}
              onAddToPlaylist={setSongToAddToPlaylist}
              onNavigateHome={() => setActivePage({ type: 'home' })}
            />
          )}

          {activePage.type === 'playlist' && (
            (() => {
              const activePl = playlists.find(p => p.id === activePage.playlistId);
              if (!activePl) {
                return (
                  <div className="p-12 text-center text-[#71717A]">
                    <p>Playlist not found.</p>
                    <button
                      onClick={() => setActivePage({ type: 'home' })}
                      className="mt-4 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg"
                    >
                      Return Home
                    </button>
                  </div>
                );
              }
              return (
                <PlaylistPage
                  playlist={activePl}
                  allSongs={songs}
                  onToggleLike={handleToggleLike}
                  onDeleteSong={handleDeleteSong}
                  onAddToPlaylist={setSongToAddToPlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                  onAddSongToPlaylist={handleAddSongToPlaylist}
                  onRenamePlaylist={(pl) =>
                    setPlaylistModalConfig({
                      isOpen: true,
                      isEdit: true,
                      playlistId: pl.id,
                      initialName: pl.name,
                      initialDesc: pl.description || ''
                    })
                  }
                  onDeletePlaylist={handleDeletePlaylist}
                />
              );
            })()
          )}
        </main>
      </div>

      {/* Bottom Music Player Bar (80px fixed height) */}
      <PlayerBar />

      {/* Upload Song Pop-Up (Modal) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        song={songToAddToPlaylist}
        playlists={playlists}
        onClose={() => setSongToAddToPlaylist(null)}
        onToggleInPlaylist={handleToggleInPlaylist}
        onCreateNewPlaylist={async (name) => {
          const newPl = await createPlaylist(name);
          setPlaylists(prev => [...prev, newPl]);
          if (songToAddToPlaylist) {
            await handleAddSongToPlaylist(newPl.id, songToAddToPlaylist.id);
          }
        }}
      />

      {/* Create / Rename Playlist Modal */}
      <CreatePlaylistModal
        isOpen={playlistModalConfig.isOpen}
        isEdit={playlistModalConfig.isEdit}
        initialName={playlistModalConfig.initialName}
        initialDescription={playlistModalConfig.initialDesc}
        onClose={() => setPlaylistModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleCreatePlaylistSubmit}
      />
    </div>
  );
};

const AuthRouter: React.FC = () => {
  const { user, displayName, loading } = useAuth();

  // 1. Loading screen: minimal pitch-black (#09090B) with subtle white spinner
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#09090B] flex flex-col items-center justify-center select-none">
        <div className="w-8 h-8 rounded-full border-2 border-[#27272A] border-t-white animate-spin" />
      </div>
    );
  }

  // 2. Not logged in: show Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 3. Logged in, but no custom name saved yet: show Name Setup Page
  if (!displayName) {
    return <NameSetupPage />;
  }

  // 4. Logged in AND name saved: show main music player app
  return (
    <PlayerProvider>
      <MainAppContent />
    </PlayerProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  );
};

export default App;
