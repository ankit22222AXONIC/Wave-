import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NameSetupPage: React.FC = () => {
  const { user, saveDisplayName } = useAuth();
  
  // Default to Google displayName or email prefix
  const initialName = user?.displayName || user?.email?.split('@')[0] || '';
  const [name, setName] = useState(initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveDisplayName(name.trim());
  };

  return (
    <div className="min-h-screen w-screen bg-[#09090B] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#121215] border border-[#27272A] rounded-2xl p-8 sm:p-10 shadow-2xl flex flex-col items-center text-center">
        {/* Wave Logo */}
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black mb-2 shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10v4" />
            <path d="M6 7v10" />
            <path d="M10 3v18" />
            <path d="M14 6v12" />
            <path d="M18 8v8" />
            <path d="M22 10v4" />
          </svg>
        </div>

        {/* User Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#1C1C21] border-2 border-[#27272A] overflow-hidden flex items-center justify-center mb-5 shadow-sm">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Google avatar" 
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={24} className="text-[#A1A1AA]" />
          )}
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Welcome! What should we call you?
        </h1>
        <p className="text-xs text-[#A1A1AA] mb-6 max-w-xs leading-relaxed">
          Set your display name for your Wave desktop session and playlists.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="text-left">
            <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arnav or Alex"
              className="w-full bg-[#1C1C21] border border-[#27272A] focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full mt-2 py-3 px-4 bg-white hover:bg-neutral-200 text-black font-semibold text-sm rounded-xl transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            Continue to App
          </button>
        </form>

        {user?.email && (
          <span className="text-[11px] text-[#71717A] mt-5 truncate max-w-xs">
            Signed in as {user.email}
          </span>
        )}
      </div>
    </div>
  );
};
