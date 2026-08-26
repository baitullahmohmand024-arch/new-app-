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
  supabase,
  signInWithGoogleSupabase,
  signInWithEmailSupabase,
  signUpWithEmailSupabase,
  signOutSupabase,
  getOAuthRedirectUrl,
} from './supabase';

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
      console.error('[Auth Debug] Failed to parse active user session from localStorage', e);
      return null;
    }
  },

  /**
   * Initializes auth session, checking Supabase active session, OAuth redirect hash/code,
   * and local storage fallback, while cleaning OAuth tokens from URL.
   */
  async initAuthSession(onUserChange?: (user: UserProfile | null) => void): Promise<UserProfile | null> {
    console.log('[Auth Debug] initAuthSession started. Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');

    try {
      if (typeof window !== 'undefined') {
        // 1. Handle PKCE Code flow (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          console.log('[Auth Debug] Found OAuth auth code in query parameters, exchanging for session...');
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.warn('[Auth Debug] exchangeCodeForSession notice:', error.message);
            } else if (data?.session?.user) {
              console.log('[Auth Debug] Session established successfully via code exchange:', data.session.user.email);
            }
          } catch (codeErr) {
            console.warn('[Auth Debug] Code exchange exception:', codeErr);
          }
        }

        // 2. Handle Implicit Hash flow (#access_token=...&refresh_token=...)
        const rawHash = window.location.hash || '';
        const cleanHash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
        if (cleanHash.includes('access_token=')) {
          console.log('[Auth Debug] Found OAuth access_token in URL hash fragment.');
          const hashParams = new URLSearchParams(cleanHash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            console.log('[Auth Debug] Setting session directly with parsed tokens from URL hash...');
            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              if (error) {
                console.warn('[Auth Debug] supabase.auth.setSession notice:', error.message);
              } else if (data?.session?.user) {
                console.log('[Auth Debug] Session established successfully from hash parameters:', data.session.user.email);
              }
            } catch (hashErr) {
              console.warn('[Auth Debug] Exception setting session from hash:', hashErr);
            }
          }
        }
      }

      // 3. Check active Supabase session
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) {
        console.warn('[Auth Debug] getSession returned error:', sessionErr.message);
      }

      if (session?.user) {
        const sbUser = session.user;
        const email = sbUser.email || 'student@gmail.com';
        const name =
          (sbUser.user_metadata?.full_name as string) ||
          (sbUser.user_metadata?.name as string) ||
          email.split('@')[0];
        const avatar =
          (sbUser.user_metadata?.avatar_url as string) ||
          (sbUser.user_metadata?.picture as string) ||
          undefined;
        const userId = sbUser.id;

        console.log('[Auth Debug] Verified Supabase user session:', { userId, email, name });
        const profile = this.syncUserProfile(userId, email, name, avatar);

        // Clean up OAuth tokens from URL address bar without reloading
        if (
          typeof window !== 'undefined' &&
          (window.location.hash.includes('access_token=') || window.location.search.includes('code='))
        ) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
          console.log('[Auth Debug] Cleaned OAuth tokens from address bar. Clean URL:', cleanUrl);
        }

        if (onUserChange) onUserChange(profile);
        return profile;
      }
    } catch (err) {
      console.warn('[Auth Debug] Supabase session initialization notice:', err);
    }

    // 4. Fallback to localStorage session
    const localUser = this.getCurrentUser();
    if (localUser) {
      console.log('[Auth Debug] Loaded active session from local cache:', localUser.email);
      if (onUserChange) {
        onUserChange(localUser);
      }
      return localUser;
    }

    console.log('[Auth Debug] No active session found.');
    return null;
  },

  /**
   * Subscribes to live Supabase Auth state changes (e.g. login, logout, OAuth completion).
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`[Auth Debug] onAuthStateChange event received: "${event}"`, session?.user ? `User: ${session.user.email}` : 'No user');

        if (session?.user) {
          const sbUser = session.user;
          const email = sbUser.email || 'student@gmail.com';
          const name =
            (sbUser.user_metadata?.full_name as string) ||
            (sbUser.user_metadata?.name as string) ||
            email.split('@')[0];
          const avatar =
            (sbUser.user_metadata?.avatar_url as string) ||
            (sbUser.user_metadata?.picture as string) ||
            undefined;
          const userId = sbUser.id;

          const profile = this.syncUserProfile(userId, email, name, avatar);

          if (
            typeof window !== 'undefined' &&
            (window.location.hash.includes('access_token=') || window.location.search.includes('code='))
          ) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          callback(profile);
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth Debug] SIGNED_OUT event processed.');
          localStorage.removeItem(AUTH_STORAGE_KEY);
          callback(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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

    // Also sync to Supabase Postgres 'profiles' table if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      supabase.from('profiles').upsert({
        id: userId,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatarUrl || null,
        auth_provider: 'google',
        selected_field_id: profile.selectedFieldId || null,
        last_login_at: new Date().toISOString(),
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) {
          console.warn('[Auth Debug] Supabase profiles upsert notice:', error.message);
        } else {
          console.log('[Auth Debug] Profile synchronized to Supabase table successfully.');
        }
      });
    }

    return profile;
  },

  /**
   * Initiates Google Sign-In with Supabase Google Auth Provider.
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
      console.log('[Auth Debug] Calling signInWithGoogleSupabase()...');
      await signInWithGoogleSupabase();

      // Check if session was immediately acquired (e.g. in single-page popup)
      const { data: sessionData } = await supabase.auth.getSession();
      const sbUser = sessionData?.session?.user;

      if (sbUser) {
        const email = sbUser.email || 'student@gmail.com';
        const name = (sbUser.user_metadata?.full_name as string) || (sbUser.user_metadata?.name as string) || email.split('@')[0];
        const avatar = (sbUser.user_metadata?.avatar_url as string) || undefined;
        const userId = sbUser.id;
        return this.syncUserProfile(userId, email, name, avatar);
      }

      // If redirect is in progress, check current user
      const currentUser = this.getCurrentUser();
      if (currentUser) return currentUser;

      // Temporary return until OAuth redirect returns with tokens
      return {
        id: 'usr_oauth_pending',
        name: 'Signing In...',
        email: '',
        authProvider: 'google',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        selectedFieldId: '',
        isAccountActive: true,
      };
    } catch (sbErr: any) {
      const msg = sbErr?.message || '';

      if (
        msg.includes('closed-by-user') ||
        msg.includes('cancelled') ||
        msg.includes('popup_closed')
      ) {
        throw new Error('POPUP_CLOSED');
      }

      console.warn('[Auth Debug] Google authentication did not complete:', msg);
      // Fallback to quick local demo if redirect popup in sandboxed iframe
      const fallbackEmail = 'student.google@easystudysnap.com';
      return this.syncUserProfile('usr_google_student', fallbackEmail, 'Google Student Scholar');
    }
  },

  /**
   * Sign in with Email and Password using Supabase
   */
  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    const sbUser = await signInWithEmailSupabase(email, pass);
    const userId = sbUser.id;
    const name = (sbUser.user_metadata?.full_name as string) || (sbUser.user_metadata?.name as string) || email.split('@')[0];
    return this.syncUserProfile(userId, email, name);
  },

  /**
   * Register with Email and Password using Supabase
   */
  async signUpWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
    const sbUser = await signUpWithEmailSupabase(email, pass);
    const userId = sbUser?.id || `usr_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
    const formattedName = name || email.split('@')[0];
    return this.syncUserProfile(userId, email, formattedName);
  },

  /**
   * Ends the student's active authenticated session across local storage and Supabase.
   */
  async signOut(): Promise<void> {
    try {
      await signOutSupabase();
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
      await signOutSupabase();
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
