import React, { useState } from 'react';
import { Smartphone, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, error, isFirebaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setInfoMessage('Please enter your email or continue with Google below.');
      return;
    }
    setInfoMessage(
      `Please use "Continue with Google" below to access your account for ${email.trim()}.`
    );
  };

  const handleUnsupportedProvider = (providerName: string) => {
    setInfoMessage(
      `${providerName} is not yet enabled for this workspace. Please click "Continue with Google" to sign in.`
    );
  };

  return (
    <div className="min-h-screen w-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      <div className="w-full max-w-[390px] flex flex-col items-center text-center py-8">
        {/* Top Soundwave Logo */}
        <div className="mb-7 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
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

        {/* Email form */}
        <form onSubmit={handleContinueWithEmail} className="w-full flex flex-col gap-3 text-left">
          <div>
            <label className="block text-xs font-bold text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInfoMessage(null);
              }}
              placeholder=""
              className="w-full h-12 px-3.5 bg-[#121212] border border-[#727272]/70 focus:border-white rounded-md text-white text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-1 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-[1.01] active:scale-[0.99] text-black font-bold text-sm flex items-center justify-center transition-all shadow-md cursor-pointer"
          >
            Continue
          </button>
        </form>

        {/* "or" text */}
        <div className="relative w-full my-6 flex items-center justify-center">
          <span className="text-xs font-medium text-[#a7a7a7]">or</span>
        </div>

        {/* 4 Rounded Pill Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* 1. Phone number */}
          <button
            type="button"
            onClick={() => handleUnsupportedProvider('Phone authentication')}
            className="w-full h-12 rounded-full border border-[#727272]/70 hover:border-white bg-transparent hover:bg-white/5 px-6 flex items-center transition-all cursor-pointer group"
          >
            <Smartphone size={19} className="text-white shrink-0" />
            <span className="flex-1 text-center font-bold text-sm text-white pr-5">
              Continue with phone number
            </span>
          </button>

          {/* 2. Google (Active real Firebase auth) */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full h-12 rounded-full border border-[#727272]/70 hover:border-white bg-transparent hover:bg-white/5 px-6 flex items-center transition-all cursor-pointer group"
          >
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
            <span className="flex-1 text-center font-bold text-sm text-white pr-5">
              Continue with Google
            </span>
          </button>

          {/* 3. Facebook */}
          <button
            type="button"
            onClick={() => handleUnsupportedProvider('Facebook authentication')}
            className="w-full h-12 rounded-full border border-[#727272]/70 hover:border-white bg-transparent hover:bg-white/5 px-6 flex items-center transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="flex-1 text-center font-bold text-sm text-white pr-5">
              Continue with Facebook
            </span>
          </button>

          {/* 4. Apple */}
          <button
            type="button"
            onClick={() => handleUnsupportedProvider('Apple authentication')}
            className="w-full h-12 rounded-full border border-[#727272]/70 hover:border-white bg-transparent hover:bg-white/5 px-6 flex items-center transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 shrink-0 text-white fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.99 1.72-.88 2.74 1 .08 2.02-.49 2.58-1.24z" />
            </svg>
            <span className="flex-1 text-center font-bold text-sm text-white pr-5">
              Continue with Apple
            </span>
          </button>
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
