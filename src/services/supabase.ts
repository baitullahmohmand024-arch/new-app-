/**
 * Easy Study Snap - Supabase Integration Service
 * 
 * Provides:
 * 1. Supabase Client Initialization (Postgres Database, Auth, Storage)
 * 2. Supabase Storage upload helpers (study_photos & study_pdfs)
 * 3. Supabase Auth helpers (Google OAuth, Email/Password login & signup)
 */

import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://bbhgxhwxfyoiktcnrwwo.supabase.co';

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_LwoS_1mlyUzl-sVzkH6Iog_GsWUtlEI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { SupabaseUser };

/**
 * Sign in with Google via Supabase OAuth
 */
export async function signInWithGoogleSupabase() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Sign in with Email / Password via Supabase
 */
export async function signInWithEmailSupabase(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data.user;
}

/**
 * Sign up with Email / Password via Supabase
 */
export async function signUpWithEmailSupabase(email: string, pass: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
  });
  if (error) throw error;
  return data.user;
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutSupabase(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn('Supabase sign out notice:', error.message);
  }
}

/**
 * Listen for live Supabase authentication state changes
 */
export function onSupabaseAuthStateChanged(callback: (user: SupabaseUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Upload Photo (base64 data URL or Blob) to Supabase Storage Bucket ('study_photos')
 */
export async function uploadPhotoToSupabase(
  userId: string,
  photoId: string,
  dataUrlOrBlob: string | Blob
): Promise<{ storagePath: string; publicUrl: string } | null> {
  try {
    let blob: Blob;
    if (typeof dataUrlOrBlob === 'string') {
      if (dataUrlOrBlob.startsWith('data:')) {
        const res = await fetch(dataUrlOrBlob);
        blob = await res.blob();
      } else if (dataUrlOrBlob.startsWith('blob:') || dataUrlOrBlob.startsWith('http')) {
        const res = await fetch(dataUrlOrBlob);
        blob = await res.blob();
      } else {
        blob = new Blob([dataUrlOrBlob], { type: 'image/jpeg' });
      }
    } else {
      blob = dataUrlOrBlob;
    }

    const filePath = `${userId}/${photoId}.jpg`;
    const { error } = await supabase.storage
      .from('study_photos')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage photo upload notice:', error.message);
      // Even if cloud bucket has specific permission, return fallback
      return null;
    }

    const { data } = supabase.storage.from('study_photos').getPublicUrl(filePath);
    return {
      storagePath: filePath,
      publicUrl: data?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/study_photos/${filePath}`,
    };
  } catch (err) {
    console.warn('Failed to upload photo to Supabase Storage:', err);
    return null;
  }
}

/**
 * Upload Study PDF Blob to Supabase Storage Bucket ('study_pdfs')
 */
export async function uploadPdfToSupabase(
  userId: string,
  pdfId: string,
  blobOrDataUrl: Blob | string
): Promise<{ storagePath: string; publicUrl: string } | null> {
  try {
    let blob: Blob;
    if (typeof blobOrDataUrl === 'string') {
      const res = await fetch(blobOrDataUrl);
      blob = await res.blob();
    } else {
      blob = blobOrDataUrl;
    }

    const filePath = `${userId}/${pdfId}.pdf`;
    const { error } = await supabase.storage
      .from('study_pdfs')
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage PDF upload notice:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('study_pdfs').getPublicUrl(filePath);
    return {
      storagePath: filePath,
      publicUrl: data?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/study_pdfs/${filePath}`,
    };
  } catch (err) {
    console.warn('Failed to upload PDF to Supabase Storage:', err);
    return null;
  }
}
