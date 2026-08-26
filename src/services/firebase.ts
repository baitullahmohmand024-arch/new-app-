/**
 * Easy Study Snap - Firebase Integration Service
 * Initializes Firebase App, Firebase Authentication (Google Sign-In),
 * and Analytics.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Provided Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAcBVLH60bnZys3Faxm9mXPqSwWilDEFws",
  authDomain: "easy-study-snap.firebaseapp.com",
  databaseURL: "https://easy-study-snap-default-rtdb.firebaseio.com",
  projectId: "easy-study-snap",
  storageBucket: "easy-study-snap.firebasestorage.app",
  messagingSenderId: "488751453821",
  appId: "1:488751453821:web:add2620c3c14d9709d0314",
  measurementId: "G-ZLWN1VJJXM"
};

// Initialize or reuse Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Analytics conditionally if supported in the browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Firebase analytics initialization skipped:', err);
    });
}

/**
 * Sign in using Firebase Google Auth Popup.
 * Returns the authenticated Firebase User.
 */
export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    // If popup was blocked or closed, or iframe environment issues occur
    const authError = error as { code?: string; message?: string };
    console.warn('Firebase Google popup sign-in encountered an issue:', authError?.code || authError?.message);
    throw error;
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailFirebase(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Create student account with Email and Password
 */
export async function signUpWithEmailFirebase(email: string, pass: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Sign out from Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Error signing out from Firebase:', e);
  }
}

/**
 * Listen for live Firebase authentication changes
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
