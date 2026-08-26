/**
 * Easy Study Snap - PDF Storage Service (Phase 10: PDF Creation & Library)
 * Provides robust offline-first persistence for generated Study PDFs
 * using IndexedDB with fallback to localStorage.
 */

import { StudyPDF } from '../types';
import { SyncService } from './syncEngine';
import { CloudBackendService } from './cloudBackend';

const DB_NAME = 'easy_study_snap_pdfs_db';
const DB_VERSION = 1;
const STORE_NAME = 'study_pdfs';

class PDFStorageManager {
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
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('chapterId', 'chapterId', { unique: false });
          store.createIndex('subjectId', 'subjectId', { unique: false });
          store.createIndex('fieldId', 'fieldId', { unique: false });
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
        console.warn('Failed to open PDF IndexedDB, using fallback storage');
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Saves or updates a generated Study PDF
   */
  async savePDF(pdf: StudyPDF, triggerSync = true): Promise<void> {
    const preparedPdf: StudyPDF = {
      ...pdf,
      updatedAt: pdf.updatedAt || Date.now(),
      syncStatus: pdf.syncStatus || 'pending',
    };

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(preparedPdf);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.savePDFFallback(preparedPdf);
    }

    if (triggerSync && preparedPdf.syncStatus === 'pending') {
      SyncService.enqueueSync('pdf', preparedPdf.id);
    }
  }

  /**
   * Retrieves all non-deleted PDFs owned by a student
   */
  async getPDFsByUser(userId: string): Promise<StudyPDF[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('userId');
        const request = index.getAll(IDBKeyRange.only(userId));

        request.onsuccess = () => {
          const results: StudyPDF[] = request.result || [];
          const filtered = results
            .filter((p) => !p.isDeleted)
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
          resolve(filtered);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      return this.getPDFsFallback(userId);
    }
  }

  /**
   * Retrieves a single PDF by ID
   */
  async getPDFById(userId: string, pdfId: string): Promise<StudyPDF | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(pdfId);

        request.onsuccess = () => {
          const result: StudyPDF | undefined = request.result;
          if (result && result.userId === userId && !result.isDeleted) {
            resolve(result);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = this.getPDFsFallback(userId);
      return list.find((p) => p.id === pdfId && !p.isDeleted) || null;
    }
  }

  /**
   * Finds the latest generated PDF for a specific chapter
   */
  async getPDFByChapter(userId: string, chapterId: string): Promise<StudyPDF | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('chapterId');
        const request = index.getAll(IDBKeyRange.only(chapterId));

        request.onsuccess = () => {
          const results: StudyPDF[] = request.result || [];
          const matches = results
            .filter((p) => p.userId === userId && !p.isDeleted)
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
          resolve(matches[0] || null);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = this.getPDFsFallback(userId);
      const matches = list
        .filter((p) => p.chapterId === chapterId && !p.isDeleted)
        .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
      return matches[0] || null;
    }
  }

  /**
   * Moves a PDF to Trash (30-day recovery vault).
   * CRITICAL: Moving a PDF to Trash DOES NOT delete the source chapter photographs!
   */
  async moveToTrash(userId: string, pdfId: string): Promise<void> {
    const existing = await this.getPDFRawById(pdfId);
    if (!existing || existing.userId !== userId) return;

    const now = Date.now();
    const trashedPdf: StudyPDF = {
      ...existing,
      isDeleted: true,
      deletedAt: now,
      trashUntil: now + 30 * 24 * 60 * 60 * 1000,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.savePDF(trashedPdf, true);
    SyncService.enqueueSync('pdf', pdfId);
  }

  /**
   * Retrieves a single PDF by ID regardless of deleted status
   */
  private async getPDFRawById(pdfId: string): Promise<StudyPDF | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(pdfId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_pdfs_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: StudyPDF[] = JSON.parse(raw);
            const found = list.find((p) => p.id === pdfId);
            if (found) return found;
          }
        }
      }
      return null;
    }
  }

  /**
   * Retrieves all trashed PDFs for a student
   */
  async getTrashedPDFs(userId: string): Promise<StudyPDF[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const results: StudyPDF[] = request.result || [];
          const trashed = results
            .filter((p) => p.userId === userId && p.isDeleted)
            .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
          resolve(trashed);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const all: StudyPDF[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('easy_study_snap_pdfs_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: StudyPDF[] = JSON.parse(raw);
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
   * Restores a trashed PDF back to the student's My PDFs vault
   */
  async restorePDF(userId: string, pdfId: string): Promise<StudyPDF | null> {
    const existing = await this.getPDFRawById(pdfId);
    if (!existing || existing.userId !== userId) return null;

    const now = Date.now();
    const restoredPdf: StudyPDF = {
      ...existing,
      isDeleted: false,
      deletedAt: undefined,
      trashUntil: undefined,
      updatedAt: now,
      syncStatus: 'pending',
    };

    await this.savePDF(restoredPdf, true);
    SyncService.enqueueSync('pdf', pdfId);
    return restoredPdf;
  }

  /**
   * Permanently deletes a PDF record from local storage and sends tombstone to cloud.
   * This action is completely irreversible.
   */
  async permanentlyDeletePDF(userId: string, pdfId: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(pdfId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.deletePDFFallback(userId, pdfId);
    }

    try {
      await CloudBackendService.deletePDF(userId, pdfId);
    } catch (e) {
      console.warn('Permanent cloud PDF delete failed', e);
    }
  }

  /**
   * Automatically sweeps and permanently purges PDFs older than 30 days
   */
  async purgeExpiredPDFs(userId: string, retentionDays = 30): Promise<number> {
    const trashed = await this.getTrashedPDFs(userId);
    const now = Date.now();
    const expirationThresholdMs = retentionDays * 24 * 60 * 60 * 1000;

    let purgedCount = 0;
    for (const pdf of trashed) {
      const deletedAt = pdf.deletedAt || 0;
      if (now - deletedAt >= expirationThresholdMs) {
        await this.permanentlyDeletePDF(userId, pdf.id);
        purgedCount++;
      }
    }
    return purgedCount;
  }

  /**
   * Simulates moving time forward for test verification of 30-day auto-purge
   */
  async simulateTimeTravel(userId: string, daysForward: number): Promise<void> {
    const trashed = await this.getTrashedPDFs(userId);
    const offsetMs = daysForward * 24 * 60 * 60 * 1000;

    for (const pdf of trashed) {
      const currentDeletedAt = pdf.deletedAt || Date.now();
      const newDeletedAt = currentDeletedAt - offsetMs;
      await this.savePDF(
        {
          ...pdf,
          deletedAt: newDeletedAt,
          trashUntil: newDeletedAt + 30 * 24 * 60 * 60 * 1000,
        },
        false
      );
    }
  }

  /**
   * Cleans up all PDFs owned by a user when account is deleted
   */
  async clearUserData(userId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const pdfs = await this.getAllPDFsForUser(userId);
      await Promise.all(
        pdfs.map(
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
      localStorage.removeItem(this.getFallbackKey(userId));
    }
  }

  /**
   * Retrieves all PDFs (active and trashed) for a specific user
   */
  async getAllPDFsForUser(userId: string): Promise<StudyPDF[]> {
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
      return this.getPDFsFallback(userId);
    }
  }

  /**
   * Deletes a PDF record (legacy helper, directs to moveToTrash)
   */
  async deletePDF(userId: string, pdfId: string): Promise<void> {
    await this.moveToTrash(userId, pdfId);
  }

  // ==========================================
  // LOCALSTORAGE FALLBACK ENGINE
  // ==========================================

  private getFallbackKey(userId: string): string {
    return `easy_study_snap_pdfs_${userId}`;
  }

  private savePDFFallback(pdf: StudyPDF): void {
    try {
      const key = this.getFallbackKey(pdf.userId);
      const existing = this.getPDFsFallback(pdf.userId);
      const index = existing.findIndex((p) => p.id === pdf.id);
      if (index >= 0) {
        existing[index] = pdf;
      } else {
        existing.push(pdf);
      }
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.error('LocalStorage PDF quota exceeded or storage error', e);
    }
  }

  private getPDFsFallback(userId: string): StudyPDF[] {
    try {
      const key = this.getFallbackKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed: StudyPDF[] = JSON.parse(raw);
      return parsed
        .filter((p) => !p.isDeleted)
        .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    } catch {
      return [];
    }
  }

  private deletePDFFallback(userId: string, pdfId: string): void {
    try {
      const key = this.getFallbackKey(userId);
      const list = this.getPDFsFallback(userId);
      const filtered = list.filter((p) => p.id !== pdfId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete PDF from fallback storage', e);
    }
  }
}

export const PDFStorageService = new PDFStorageManager();
