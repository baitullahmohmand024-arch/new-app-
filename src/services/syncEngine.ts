/**
 * Easy Study Snap - Offline-First Sync Engine (Phase 9: Cloud Synchronization)
 *
 * Implements:
 * 1. Offline queue management for Fields, Subjects, Chapters, and Photos.
 * 2. Automatic reconnection triggers & exponential backoff retry.
 * 3. Last-Write-Wins (LWW) conflict resolution for structured data.
 * 4. Idempotent sequential photo uploads with duplicate prevention.
 * 5. Multi-device pull & recovery sync on login.
 * 6. Live sync progress observables for UI indicators.
 */

import {
  AcademicField,
  Subject,
  Chapter,
  BoardPhoto,
  StudyPDF,
  SyncProgress,
  SyncStatus,
  SyncQueueItem,
} from '../types';
import { StorageService } from './storage';
import { PhotoStorageService } from './photoStorage';
import { PDFStorageService } from './pdfStorage';
import { CloudBackendService, DeviceOfflineError } from './cloudBackend';

const SYNC_QUEUE_KEY_PREFIX = 'easy_study_snap_sync_queue_';
const LAST_SYNC_TIMESTAMP_KEY = 'easy_study_snap_last_sync_time_';

type SyncListener = (progress: SyncProgress) => void;

class SyncEngineManager {
  private activeUserId: string | null = null;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: any = null;
  private retryTimeout: any = null;
  private retryAttempts = 0;
  private maxRetries = 5;

  private currentProgress: SyncProgress = {
    status: 'synced',
    totalPending: 0,
    syncedCount: 0,
    isOnline: true,
    lastSyncedAt: null,
    lastError: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentProgress.isOnline = CloudBackendService.isOnline();

      // Listen for network state transitions
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      window.addEventListener('study_snap_network_change', (e: any) => {
        this.handleNetworkChange(e.detail?.isOnline ?? CloudBackendService.isOnline());
      });
    }
  }

  /**
   * Initializes the sync engine for an authenticated user session
   */
  init(userId: string): void {
    this.activeUserId = userId;
    this.retryAttempts = 0;

    // Load last sync timestamp
    try {
      const stored = localStorage.getItem(`${LAST_SYNC_TIMESTAMP_KEY}${userId}`);
      if (stored) {
        this.currentProgress.lastSyncedAt = parseInt(stored, 10);
      }
    } catch {
      this.currentProgress.lastSyncedAt = null;
    }

    this.updatePendingCount();

    // Start background sync interval (every 45s if online)
    this.startAutoSync();

    // Trigger initial sync if online
    if (CloudBackendService.isOnline()) {
      this.performSync({ isInitialLogin: false });
    }
  }

  /**
   * Stops sync loops upon sign out
   */
  destroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.activeUserId = null;
    this.isSyncing = false;
  }

  /**
   * Subscribes to live sync progress updates
   */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getProgress());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Returns current sync state
   */
  getProgress(): SyncProgress {
    return { ...this.currentProgress };
  }

  private notify(): void {
    const p = this.getProgress();
    this.listeners.forEach((fn) => fn(p));
  }

  private handleNetworkChange(isOnline: boolean): void {
    this.currentProgress.isOnline = isOnline;
    if (!isOnline) {
      this.currentProgress.status = 'waiting_for_network';
      this.notify();
    } else {
      // Reconnected! Trigger auto sync
      this.retryAttempts = 0;
      this.performSync();
    }
  }

  private startAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    this.autoSyncInterval = setInterval(() => {
      const settings = StorageService.getSettings();
      if (settings.autoSyncEnabled && CloudBackendService.isOnline() && !this.isSyncing) {
        this.performSync();
      }
    }, 45000);
  }

  /**
   * Calculates how many items are waiting to be synchronized
   */
  async updatePendingCount(): Promise<number> {
    if (!this.activeUserId) return 0;
    const userId = this.activeUserId;

    // Check structured data
    const chapters = StorageService.getChapters(userId);
    const pendingChapters = chapters.filter((c) => c.syncStatus === 'pending').length;

    const subjects = StorageService.getSubjects(userId);
    const pendingSubjects = subjects.filter((s) => s.syncStatus === 'pending').length;

    // Check photos
    let pendingPhotosCount = 0;
    for (const chap of chapters) {
      const photos = await PhotoStorageService.getPhotosByChapter(userId, chap.id);
      pendingPhotosCount += photos.filter((p) => p.syncStatus === 'pending').length;
    }

    // Check PDFs
    const pdfs = await PDFStorageService.getPDFsByUser(userId);
    const pendingPdfsCount = pdfs.filter((p) => p.syncStatus === 'pending').length;

    const total = pendingChapters + pendingSubjects + pendingPhotosCount + pendingPdfsCount;
    this.currentProgress.totalPending = total;

    if (total === 0 && this.currentProgress.status !== 'syncing') {
      this.currentProgress.status = 'synced';
    } else if (total > 0 && this.currentProgress.status === 'synced') {
      this.currentProgress.status = CloudBackendService.isOnline() ? 'pending' : 'waiting_for_network';
    }

    this.notify();
    return total;
  }

  /**
   * Marks a specific entity as pending sync locally
   */
  enqueueSync(entityType: 'field' | 'subject' | 'chapter' | 'photo' | 'pdf', entityId: string): void {
    if (!this.activeUserId) return;
    this.updatePendingCount();

    // Trigger debounced sync if online
    if (CloudBackendService.isOnline() && !this.isSyncing) {
      if (this.retryTimeout) clearTimeout(this.retryTimeout);
      this.retryTimeout = setTimeout(() => this.performSync(), 1500);
    }
  }

  /**
   * Main Synchronization Pipeline:
   * 1. Check network
   * 2. Push & merge local structured data to cloud
   * 3. Push pending photos sequentially (with duplicate protection)
   * 4. Pull any missing cloud chapters and photos to local storage
   */
  async performSync(options: { isInitialLogin?: boolean; onComplete?: () => void } = {}): Promise<boolean> {
    if (!this.activeUserId || this.isSyncing) {
      return false;
    }

    const userId = this.activeUserId;
    const isOnline = CloudBackendService.isOnline();

    if (!isOnline) {
      this.currentProgress.status = 'waiting_for_network';
      this.currentProgress.isOnline = false;
      this.notify();
      return false;
    }

    this.isSyncing = true;
    this.currentProgress.status = 'syncing';
    this.currentProgress.lastError = null;
    this.notify();

    try {
      // 1. Structured Data Sync (Fields, Subjects, Chapters)
      this.currentProgress.currentEntity = 'Academic structure';
      this.notify();

      const localFields = StorageService.getFields(userId);
      const localSubjects = StorageService.getSubjects(userId);
      const localChapters = StorageService.getChapters(userId);

      const structuredResult = await CloudBackendService.syncStructuredData(userId, {
        fields: localFields,
        subjects: localSubjects,
        chapters: localChapters,
      });

      // Update local storage with merged structured data
      StorageService.saveFields(userId, structuredResult.mergedFields);
      StorageService.saveSubjects(userId, structuredResult.mergedSubjects);
      StorageService.saveChapters(userId, structuredResult.mergedChapters);

      // 2. Photo Uploads (Sequential & Idempotent)
      this.currentProgress.currentEntity = 'Board photos';
      this.notify();

      let syncedPhotosCount = 0;

      for (const chapter of structuredResult.mergedChapters) {
        const localPhotos = await PhotoStorageService.getPhotosByChapter(userId, chapter.id);
        const pendingPhotos = localPhotos.filter((p) => p.syncStatus === 'pending' || !p.cloudUrl);

        for (const photo of pendingPhotos) {
          try {
            const uploadResult = await CloudBackendService.uploadPhoto(userId, photo);
            const updatedPhoto: BoardPhoto = {
              ...photo,
              cloudUrl: uploadResult.cloudUrl,
              syncStatus: 'synced',
              lastSyncedAt: uploadResult.uploadedAt,
            };
            await PhotoStorageService.savePhoto(updatedPhoto);
            syncedPhotosCount++;
          } catch (uploadErr) {
            console.warn(`Failed to upload photo ${photo.id}, will retry later`, uploadErr);
          }
        }
      }

      // 3. PDF Uploads (Sequential & Idempotent)
      this.currentProgress.currentEntity = 'Study PDFs';
      this.notify();

      const localPdfs = await PDFStorageService.getPDFsByUser(userId);
      const pendingPdfs = localPdfs.filter((p) => p.syncStatus === 'pending' || !p.cloudUrl);

      for (const pdf of pendingPdfs) {
        try {
          const uploadResult = await CloudBackendService.uploadPDF(userId, pdf);
          const updatedPdf: StudyPDF = {
            ...pdf,
            cloudUrl: uploadResult.cloudUrl,
            syncStatus: 'synced',
            updatedAt: uploadResult.uploadedAt,
          };
          await PDFStorageService.savePDF(updatedPdf, false);
        } catch (pdfErr) {
          console.warn(`Failed to upload PDF ${pdf.id}, will retry later`, pdfErr);
        }
      }

      // 4. Multi-Device Pull: check if cloud has photos, chapters or PDFs that local is missing
      const cloudBackup = await CloudBackendService.fetchFullCloudBackup(userId);
      for (const cloudPhoto of cloudBackup.photos) {
        if (!cloudPhoto.isDeleted) {
          const localChapterPhotos = await PhotoStorageService.getPhotosByChapter(userId, cloudPhoto.chapterId);
          const existsLocally = localChapterPhotos.some((p) => p.id === cloudPhoto.id);
          if (!existsLocally) {
            // Restore from cloud photo
            await PhotoStorageService.savePhoto({
              ...cloudPhoto,
              syncStatus: 'synced',
            });
          }
        }
      }

      // Pull missing cloud PDFs
      if (cloudBackup.pdfs) {
        for (const cloudPdf of cloudBackup.pdfs) {
          if (!cloudPdf.isDeleted) {
            const existsLocally = await PDFStorageService.getPDFById(userId, cloudPdf.id);
            if (!existsLocally) {
              await PDFStorageService.savePDF({
                ...cloudPdf,
                syncStatus: 'synced',
              }, false);
            }
          }
        }
      }

      // 5. Finalize Sync Success
      const now = Date.now();
      this.currentProgress.status = 'synced';
      this.currentProgress.lastSyncedAt = now;
      this.currentProgress.totalPending = 0;
      this.currentProgress.syncedCount = syncedPhotosCount;
      this.currentProgress.currentEntity = undefined;
      this.retryAttempts = 0;

      try {
        localStorage.setItem(`${LAST_SYNC_TIMESTAMP_KEY}${userId}`, now.toString());
      } catch (e) {
        console.error('Failed to save last sync timestamp', e);
      }

      this.isSyncing = false;
      this.notify();

      if (options.onComplete) {
        options.onComplete();
      }

      return true;
    } catch (error: any) {
      this.isSyncing = false;

      // Handle expected offline conditions gracefully
      if (
        error instanceof DeviceOfflineError ||
        error?.name === 'DeviceOfflineError' ||
        !CloudBackendService.isOnline() ||
        error?.message?.includes('Device is offline')
      ) {
        this.currentProgress.status = 'waiting_for_network';
        this.currentProgress.isOnline = false;
        this.currentProgress.lastError = null;
        this.currentProgress.currentEntity = undefined;
        this.notify();
        return false;
      }

      console.warn('Sync encountered an issue, will retry:', error);
      this.currentProgress.status = 'error';
      this.currentProgress.lastError = error?.message || 'Sync failed temporarily';
      this.currentProgress.currentEntity = undefined;
      this.notify();

      // Schedule backoff retry
      if (this.retryAttempts < this.maxRetries && CloudBackendService.isOnline()) {
        this.retryAttempts++;
        const backoffMs = Math.min(1000 * Math.pow(2, this.retryAttempts), 30000);
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        this.retryTimeout = setTimeout(() => this.performSync(), backoffMs);
      }

      return false;
    }
  }

  /**
   * Switches device simulation context (e.g. "Phone A" vs "Tablet B")
   * Clears in-memory pointers while preserving cloud storage so multi-device testing is seamless.
   */
  async switchSimulatedDevice(newDeviceId: string, currentUserId: string): Promise<void> {
    const settings = StorageService.getSettings();
    settings.simulatedDeviceId = newDeviceId;
    StorageService.saveSettings(settings);

    // Trigger full pull sync to emulate opening the app on the selected device
    await this.performSync({ isInitialLogin: true });
  }
}

export const SyncService = new SyncEngineManager();
