import React, { useState } from 'react';
import { Smartphone, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, error, isFirebaseConfigured } = useAuth();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleUnsupportedProvider = (providerName: string) => {
    setInfoMessage(
      `${providerName} is coming soon. Please click "Continue with Google" to sign in.`
    );
  };

  return (
    <div className="min-h-screen w-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      <div className="w-full max-w-[390px] flex flex-col items-center text-center py-8">
        {/* Wave Brand Logo */}
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg shadow-white/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 10v4" />
              <path d="M6 7v10" />
              <path d="M10 3v18" />
              <path d="M14 6v12" />
              <path d="M18 8v8" />
              <path d="M22 10v4" />
            </svg>
          </div>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
          Welcome back
        </h1>

        {/* Feedback / Error notifications */}
        {error && (
          <div className="w-full mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 text-left">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="w-full mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5 text-left">
            <Info size={15} className="shrink-0 mt-0.5" />
            <span className="leading-tight">{infoMessage}</span>
          </div>
        )}

        {!isFirebaseConfigured && (
          <div className="w-full mb-5 p-3 rounded-lg bg-[#1C1C21] border border-[#27272A] text-[#A1A1AA] text-xs text-left">
            <p className="font-semibold text-white mb-1">Firebase Configuration Needed</p>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Add your Firebase credentials to <code className="text-white bg-[#09090B] px-1 py-0.5 rounded">.env</code> to enable authentication.
            </p>
          </div>
        )}

        {/* Options */}
        <div className="w-full flex flex-col gap-3">
          {/* 1. Phone number (Cut with white line + Coming Soon) */}
          <div
            className="w-full h-12 rounded-full border border-[#727272]/40 bg-white/[0.02] px-5 flex items-center justify-between opacity-60 cursor-not-allowed"
            title="Coming Soon"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Smartphone size={18} className="text-white/60 shrink-0" />
              <span className="line-through decoration-white decoration-2 font-bold text-xs sm:text-sm text-white/70 truncate">
                Continue with phone number
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
              Coming Soon
            </span>
          </div>

          {/* 2. Google (ACTIVE - Fully functional, NOT cut) */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full h-12 rounded-full border border-white/80 hover:border-white bg-white/5 hover:bg-white/10 px-5 flex items-center justify-between transition-all cursor-pointer group shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Multi-color Google G icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-bold text-sm text-white group-hover:text-white">
                Continue with Google
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0 ml-2">
              Active
            </span>
          </button>

          {/* 3. Facebook (Cut with white line + Coming Soon) */}
          <div
            className="w-full h-12 rounded-full border border-[#727272]/40 bg-white/[0.02] px-5 flex items-center justify-between opacity-60 cursor-not-allowed"
            title="Coming Soon"
          >
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="line-through decoration-white decoration-2 font-bold text-xs sm:text-sm text-white/70 truncate">
                Continue with Facebook
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
              Coming Soon
            </span>
          </div>

          {/* 4. Apple (Cut with white line + Coming Soon) */}
          <div
            className="w-full h-12 rounded-full border border-[#727272]/40 bg-white/[0.02] px-5 flex items-center justify-between opacity-60 cursor-not-allowed"
            title="Coming Soon"
          >
            <div className="flex items-center gap-3 min-w-0">
              <svg className="w-5 h-5 shrink-0 text-white/70 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.99 1.72-.88 2.74 1 .08 2.02-.49 2.58-1.24z" />
              </svg>
              <span className="line-through decoration-white decoration-2 font-bold text-xs sm:text-sm text-white/70 truncate">
                Continue with Apple
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-white/90 border border-white/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Bottom footer text */}
        <div className="mt-12 flex flex-col items-center gap-1.5">
          <span className="text-sm text-[#a7a7a7]">
            Don't have an account?
          </span>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="text-sm font-bold text-white hover:underline cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};
