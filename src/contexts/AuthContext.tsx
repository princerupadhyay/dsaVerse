import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { UserProgress } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  progress: UserProgress | null;
  progressLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (data: Partial<UserProgress>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  rank: 'Beginner',
  streak: 0,
  lastActiveDate: '',
  completedWorlds: [],
  completedPatterns: [],
  problemStatuses: {},
  earnedAchievements: [],
  currentWorld: 1,
  srCards: {},
  totalReviews: 0,
  preferences: {
    theme: 'dark',
    soundEnabled: true,
    animationsEnabled: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setProgress(null);
      return;
    }

    setProgressLoading(true);
    const userRef = doc(db, 'users', user.uid);

    // Real-time listener for progress
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress({ ...defaultProgress, ...docSnap.data() } as UserProgress);
      } else {
        setProgress(defaultProgress);
      }
      setProgressLoading(false);
    }, (error) => {
      console.error('Error listening to progress:', error);
      setProgressLoading(false);
    });

    unsubRef.current = unsubscribe;

    // Initialize user document if new
    getDoc(userRef).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(userRef, defaultProgress);
      }
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
    };
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const saveProgress = async (data: Partial<UserProgress>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        progress,
        progressLoading,
        signInWithGoogle,
        signOut,
        saveProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
