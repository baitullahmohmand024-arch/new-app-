/**
 * Easy Study Snap - Photo Storage Service (Phase 6: Board Camera)
 * Uses IndexedDB for high-capacity offline image blob/DataURL persistence,
 * with fallback to scoped local storage.
 */

import { BoardPhoto } from '../types';
import { SyncService } from './syncEngine';
import { CloudBackendService } from './cloudBackend';

const DB_NAME = 'easy_study_snap_photos_db';
const DB_VERSION = 1;
const STORE_NAME = 'board_photos';

class PhotoStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('chapterId', 'chapterId', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onclose = () => {
          this.dbPromise = null;
        };
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        this.dbPromise = null;
        console.warn('Failed to open IndexedDB, using localStorage fallback');
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Saves a single board photo to persistent offline storage
   */
  async savePhoto(photo: BoardPhoto, triggerSync = true): Promise<void> {
    const preparedPhoto: BoardPhoto = {
      ...photo,
      updatedAt: photo.updatedAt || Date.now(),
      syncStatus: photo.syncStatus || 'pending',
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(preparedPhoto);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      // LocalStorage fallback for non-IndexedDB environments
      this.savePhotoFallback(preparedPhoto);
    }

    if (triggerSync && preparedPhoto.syncStatus === 'pending') {
      SyncService.enqueueSync('photo', preparedPhoto.id);
    }
  }

  /**
   * Bulk saves multiple board photos in a single atomic transaction
   */
  async savePhotos(photos: BoardPhoto[], triggerSync = true): Promise<void> {
    if (photos.length === 0) return;
    const now = Date.now();
    const preparedList = photos.map((p) => ({
      ...p,
      updatedAt: p.updatedAt || now,
      syncStatus: p.syncStatus || 'pending',
    }));

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        preparedList.forEach((photo) => {
          store.put(photo);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } catch {
      preparedList.forEach((p) => this.savePhotoFallback(p));
    }

    if (triggerSync) {
      preparedList.forEach((p) => {
        if (p.syncStatus === 'pending') {
          SyncService.enqueueSync('photo', p.id);
        }
      });
    }
  }

  /**
   * Updates order indices of photos in a chapter
   */
  async updatePhotoOrders(userId: string, chapterId: string, orderedPhotoIds: string[]): Promise<void> {
    const existingPhotos = await this.getPhotosByChapter(userId, chapterId);
    const photoMap = new Map<string, BoardPhoto>();
    existingPhotos.forEach((p) => photoMap.set(p.id, p));

    const updatedList: BoardPhoto[] = [];
    orderedPhotoIds.forEach((id, index) => {
      const p = photoMap.get(id);
      if (p) {
        updatedList.push({
          ...p,
          orderIndex: index + 1,
          updatedAt: Date.now(),
          syncStatus: 'pending',
        });
      }
    });

    if (updatedList.length > 0) {
      await this.savePhotos(updatedList);
    }
  }


  /**
   * Retrieves all board photos belonging to a specific chapter for the current student
   */
  async getPhotosByChapter(userId: string, chapterId: string): Promise<BoardPhoto[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('chapterId');
        const request = index.getAll(IDBKeyRange.only(chapterId));

        request.onsuccess = () => {
          const results: BoardPhoto[] = request.result || [];
          // Filter by userId and non-deleted, sorted by orderIndex and createdAt
          const filtered = results
            .filter((p) => p.userId === userId && !p.isDeleted)
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.createdAt - b.createdAt);
          resolve(filtered);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.getPhotosFallback(userId, chapterId);
    }
  }

  /**
   * Moves a board photo to Trash (30-day recovery vault)
   */
  async moveToTrash(userId: string, photoId: string): Promise<void> {
    const photo = await this.getPhotoById(photoId);
    if (!photo || photo.userId !== userId) return;

    const now = Date.now();
    const trashedPhoto: BoardPhoto = {
      ...photo,
      isDeleted: true,
      deletedAt: now,
      trashUntil: now + 30 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.savePhoto(trashedPhoto, true);
    SyncService.enqueueSync('photo', photoId);
  }

  /**
   * Retrieves all active non-deleted photos for a student across all chapters
   */
  async getAllActivePhotos(userId: string): Promise<BoardPhoto[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(IDBKeyRange.only(userId));

        request.onsuccess = () => {
          const results: BoardPhoto[] = request.result || [];
          const filtered = results
            .filter((p) => !p.isDeleted)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          resolve(filtered);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const all: BoardPhoto[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_photos_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: BoardPhoto[] = JSON.parse(raw);
            list.forEach((p) => {
              if (p.userId === userId && !p.isDeleted) {
                all.push(p);
              }
            });
          }
        }
      }
      return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  }

  /**
   * Retrieves a single photo by ID
   */
  async getPhotoById(photoId: string): Promise<BoardPhoto | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(photoId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_photos_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: BoardPhoto[] = JSON.parse(raw);
            const found = list.find((p) => p.id === photoId);
            if (found) return found;
          }
        }
      }
      return null;
    }
  }

  /**
   * Retrieves all trashed photos for a student
   */
  async getTrashedPhotos(userId: string): Promise<BoardPhoto[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const results: BoardPhoto[] = request.result || [];
          const trashed = results
            .filter((p) => p.userId === userId && p.isDeleted)
            .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
          resolve(trashed);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const all: BoardPhoto[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_photos_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: BoardPhoto[] = JSON.parse(raw);
            list.forEach((p) => {
              if (p.userId === userId && p.isDeleted) {
                all.push(p);
              }
            });
          }
        }
      }
      return all.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
    }
  }

  /**
   * Restores a trashed photo back to its original chapter.
   * Resolves orderIndex conflicts safely so no duplicate ordering occurs.
   */
  async restorePhoto(userId: string, photoId: string): Promise<BoardPhoto | null> {
    const photo = await this.getPhotoById(photoId);
    if (!photo || photo.userId !== userId) return null;

    // Get active photos in the destination chapter
    const activePhotos = await this.getPhotosByChapter(userId, photo.chapterId);
    const existingOrders = new Set(activePhotos.map((p) => p.orderIndex));

    let safeOrderIndex = photo.orderIndex;
    if (existingOrders.has(safeOrderIndex)) {
      // Order collision: place at the end of the chapter list
      safeOrderIndex = activePhotos.length + 1;
    }

    const now = Date.now();
    const restoredPhoto: BoardPhoto = {
      ...photo,
      orderIndex: safeOrderIndex,
      isDeleted: false,
      deletedAt: undefined,
      trashUntil: undefined,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.savePhoto(restoredPhoto, true);
    SyncService.enqueueSync('photo', photoId);
    return restoredPhoto;
  }

  /**
   * Permanently deletes a board photo from local storage and sends tombstone to cloud
   */
  async permanentlyDeletePhoto(userId: string, photoId: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(photoId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.deletePhotoFallback(photoId);
    }

    // Also purge from cloud backend storage if online/cached
    try {
      await CloudBackendService.deletePhoto(userId, photoId);
    } catch (e) {
      console.warn('Permanent cloud photo delete failed, queued', e);
    }
  }

  /**
   * Permanently deletes multiple photos by ID in batch
   */
  async permanentlyDeletePhotos(userId: string, photoIds: string[]): Promise<void> {
    for (const id of photoIds) {
      await this.permanentlyDeletePhoto(userId, id);
    }
  }

  /**
   * Automatically sweeps and permanently purges items older than 30 days
   */
  async purgeExpiredPhotos(userId: string, retentionDays = 30): Promise<number> {
    const trashed = await this.getTrashedPhotos(userId);
    const now = Date.now();
    const expirationThresholdMs = retentionDays * 24 * 60 * 60 * 1000;

    let purgedCount = 0;
    for (const photo of trashed) {
      const deletedAt = photo.deletedAt || 0;
      if (now - deletedAt >= expirationThresholdMs) {
        await this.permanentlyDeletePhoto(userId, photo.id);
        purgedCount++;
      }
    }
    return purgedCount;
  }

  /**
   * Simulates moving time forward for test verification of 30-day auto-purge
   */
  async simulateTimeTravel(userId: string, daysForward: number): Promise<void> {
    const trashed = await this.getTrashedPhotos(userId);
    const offsetMs = daysForward * 24 * 60 * 60 * 1000;

    for (const photo of trashed) {
      const currentDeletedAt = photo.deletedAt || Date.now();
      const newDeletedAt = currentDeletedAt - offsetMs;
      await this.savePhoto(
        {
          ...photo,
          deletedAt: newDeletedAt,
          trashUntil: newDeletedAt + 30 * 24 * 60 * 60 * 1000,
        },
        false
      );
    }
  }

  /**
   * Cleans up all photos owned by a user when account is deleted
   */
  async clearUserData(userId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const photos = await this.getAllPhotosForUser(userId);
      await Promise.all(
        photos.map(
          (p) =>
            new Promise<void>((resolve, reject) => {
              const transaction = db.transaction([STORE_NAME], 'readwrite');
              const store = transaction.objectStore(STORE_NAME);
              const request = store.delete(p.id);
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            })
        )
      );
    } catch {
      // Fallback cleanup
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`easy_study_snap_photos_${userId}`)) {
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Retrieves all photos (active and trashed) for a specific user
   */
  async getAllPhotosForUser(userId: string): Promise<BoardPhoto[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(IDBKeyRange.only(userId));
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      const all: BoardPhoto[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`easy_study_snap_photos_${userId}`)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            all.push(...JSON.parse(raw));
          }
        }
      }
      return all;
    }
  }

  /**
   * Deletes a board photo by ID (legacy helper, directs to moveToTrash)
   */
  async deletePhoto(photoId: string): Promise<void> {
    const photo = await this.getPhotoById(photoId);
    if (photo) {
      await this.moveToTrash(photo.userId, photoId);
    }
  }

  /**
   * Deletes multiple photos by ID in batch
   */
  async deletePhotos(photoIds: string[]): Promise<void> {
    for (const id of photoIds) {
      await this.deletePhoto(id);
    }
  }

  /**
   * Counts photos in a chapter
   */
  async getChapterPhotoCount(userId: string, chapterId: string): Promise<number> {
    const photos = await this.getPhotosByChapter(userId, chapterId);
    return photos.length;
  }

  // ==========================================
  // LOCALSTORAGE FALLBACK ENGINE
  // ==========================================

  private getFallbackKey(userId: string, chapterId: string): string {
    return `easy_study_snap_photos_${userId}_${chapterId}`;
  }

  private savePhotoFallback(photo: BoardPhoto): void {
    try {
      const key = this.getFallbackKey(photo.userId, photo.chapterId);
      const existing = this.getPhotosFallback(photo.userId, photo.chapterId);
      const index = existing.findIndex((p) => p.id === photo.id);
      if (index >= 0) {
        existing[index] = photo;
      } else {
        existing.push(photo);
      }
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error('LocalStorage photo quota exceeded or storage error', e);
      throw new Error('Unable to save photo. Local storage quota exceeded.');
    }
  }

  private getPhotosFallback(userId: string, chapterId: string): BoardPhoto[] {
    try {
      const key = this.getFallbackKey(userId, chapterId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed: BoardPhoto[] = JSON.parse(raw);
      return parsed
        .filter((p) => !p.isDeleted)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.createdAt - b.createdAt);
    } catch {
      return [];
    }
  }

  private deletePhotoFallback(photoId: string): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_photos_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: BoardPhoto[] = JSON.parse(raw);
            const filtered = list.filter((p) => p.id !== photoId);
            if (filtered.length !== list.length) {
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to delete photo from fallback storage', e);
    }
  }
}

export const PhotoStorageService = new PhotoStorageManager();
