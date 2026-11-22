import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  type User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';

interface AuthContextType {
  user: User | null;
  displayName: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveDisplayName: (name: string) => void;
  clearError: () => void;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_PREFIX = 'wave_user_name_';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is not configured with keys yet, finish loading so login screen can explain
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const savedName = localStorage.getItem(`${STORAGE_PREFIX}${currentUser.uid}`);
          setDisplayName(savedName || null);
        } else {
          setDisplayName(null);
        }
        setLoading(false);
      },
      (authError) => {
        console.error('Firebase Auth state error:', authError);
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError('Firebase credentials are not configured in your .env file yet.');
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      setUser(loggedUser);
      // Check if user already has saved display name
      const savedName = localStorage.getItem(`${STORAGE_PREFIX}${loggedUser.uid}`);
      if (savedName) {
        setDisplayName(savedName);
      } else {
        setDisplayName(null);
      }
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      console.warn('Google Sign-In failed:', authErr);
      if (authErr.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing.');
      } else if (authErr.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled.');
      } else if (authErr.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized in Firebase Console -> Auth -> Settings -> Authorized domains.');
      } else if (authErr.code === 'auth/network-request-failed') {
        setError('Network error: please check your internet connection.');
      } else {
        setError(authErr.message || 'Failed to sign in with Google. Please try again.');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setDisplayName(null);
    } catch (err: unknown) {
      const authErr = err as { message?: string };
      setError(authErr.message || 'Failed to log out.');
    }
  }, []);

  const saveDisplayName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    localStorage.setItem(`${STORAGE_PREFIX}${user.uid}`, trimmed);
    setDisplayName(trimmed);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        displayName,
        loading,
        error,
        signInWithGoogle,
        logout,
        saveDisplayName,
        clearError,
        isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
