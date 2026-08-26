/**
 * Easy Study Snap - Authentication Service
 * Phase 3: Authentication & Student Account Foundation
 *
 * Implements Google Authentication flow, offline session persistence,
 * user identity management, and student data isolation.
 */

import { UserProfile } from '../types';
import { StorageService } from './storage';
import { PhotoStorageService } from './photoStorage';
import { PDFStorageService } from './pdfStorage';
import { CloudBackendService } from './cloudBackend';
import {
  auth,
  signInWithGoogleFirebase,
  signInWithEmailFirebase,
  signUpWithEmailFirebase,
  signOutFirebase,
} from './firebase';

const AUTH_STORAGE_KEY = 'easy_study_snap_auth_user';

export const AuthService = {
  /**
   * Retrieves the currently active authenticated student profile.
   * Restores session from secure persistent local storage (survives app reloads & offline restarts).
   */
  getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed: UserProfile = JSON.parse(stored);
      return parsed.isAccountActive ? parsed : null;
    } catch (e) {
      console.error('Failed to parse active user session', e);
      return null;
    }
  },

  /**
   * Converts a Firebase user or student credentials into our standard UserProfile.
   */
  syncUserProfile(
    userId: string,
    email: string,
    formattedName: string,
    avatarUrl?: string
  ): UserProfile {
    const existing = localStorage.getItem(`profile_${userId}`);
    let profile: UserProfile;

    if (existing) {
      profile = JSON.parse(existing);
      profile.lastLoginAt = Date.now();
      profile.isAccountActive = true;
      if (avatarUrl && (!profile.avatarUrl || profile.avatarUrl.includes('dicebear'))) {
        profile.avatarUrl = avatarUrl;
      }
      if (profile.hasSelectedInitialField === undefined) {
        profile.hasSelectedInitialField = Boolean(profile.selectedFieldId);
      }
    } else {
      profile = {
        id: userId,
        name: formattedName,
        email: email,
        avatarUrl:
          avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=4f46e5&textColor=ffffff`,
        authProvider: 'google',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        selectedFieldId: '',
        hasSelectedInitialField: false,
        isAccountActive: true,
      };
    }

    // Persist current active session and profile record
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));

    return profile;
  },

  /**
   * Initiates Google Sign-In with Firebase official Google Auth Provider.
   * Google Provider is configured with prompt: 'select_account' so the user
   * can choose from their available Google accounts on their device.
   * If cancelled or failed, no partial profile or default user is created.
   */
  async signInWithGoogle(customEmail?: string, customName?: string): Promise<UserProfile> {
    if (customEmail) {
      // Direct custom account selection (e.g. multi-student switch or testing)
      await new Promise((resolve) => setTimeout(resolve, 300));
      const email = customEmail;
      const defaultName = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName =
        customName ||
        defaultName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') ||
        'Student Scholar';

      const userId = `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      return this.syncUserProfile(userId, email, formattedName);
    }

    try {
      // Trigger official Firebase Google Auth popup configured with prompt='select_account'
      const fbUser = await signInWithGoogleFirebase();
      const email = fbUser.email || 'student@gmail.com';
      const name = fbUser.displayName || email.split('@')[0];
      const avatar = fbUser.photoURL || undefined;
      const userId = fbUser.uid || `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

      return this.syncUserProfile(userId, email, name, avatar);
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      const msg = fbErr?.message || '';

      // User closed or cancelled the Google Account picker
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled' ||
        msg.includes('closed-by-user') ||
        msg.includes('cancelled-popup-request')
      ) {
        throw new Error('POPUP_CLOSED');
      }

      // Other authentication failure - propagate so UI can show friendly error and retry
      console.warn('Google authentication did not complete:', code || msg);
      throw new Error('AUTH_FAILED');
    }
  },

  /**
   * Sign in with Email and Password using Firebase
   */
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const fbUser = await signInWithEmailFirebase(email, pass);
    const userId = fbUser.uid;
    const name = fbUser.displayName || email.split('@')[0];
    return this.syncUserProfile(userId, email, name);
  },

  /**
   * Register with Email and Password using Firebase
   */
  async signUpWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
    const fbUser = await signUpWithEmailFirebase(email, pass);
    const userId = fbUser.uid;
    const formattedName = name || email.split('@')[0];
    return this.syncUserProfile(userId, email, formattedName);
  },

  /**
   * Ends the student's active authenticated session across local storage and Firebase.
   */
  async signOut(): Promise<void> {
    try {
      await signOutFirebase();
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Error during sign out', e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  /**
   * Permanently deletes the student account and all isolated user records.
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      await signOutFirebase();
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(`profile_${userId}`);
      localStorage.removeItem(`easy_study_snap_recent_chapters_${userId}`);
      localStorage.removeItem(`easy_study_snap_search_history_${userId}`);
      // Remove all user-scoped records from local storage and IndexedDB
      StorageService.clearUserData(userId);
      await PhotoStorageService.clearUserData(userId);
      await PDFStorageService.clearUserData(userId);
      // Remove cloud-persisted user backup
      await CloudBackendService.deleteAccountData(userId);
    } catch (e) {
      console.error('Error during account deletion', e);
    }
  },
};
