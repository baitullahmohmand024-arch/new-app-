/**
 * Easy Study Snap - Trash & Recovery Service (Phase 11: Trash, Recovery & Safe Deletion)
 * 
 * Provides unified management for:
 * 1. 30-day retention and countdown calculations
 * 2. Safe restoration with order collision avoidance
 * 3. Cascade chapter recovery (restoring chapter restores its snapshots)
 * 4. Irreversible permanent deletion and storage cleanup
 * 5. Automatic 30-day expiration sweep on startup
 * 6. Offline trash management and conflict-free synchronization
 */

import { TrashedItem, TrashItemType, BoardPhoto, StudyPDF, Chapter } from '../types';
import { PhotoStorageService } from './photoStorage';
import { PDFStorageService } from './pdfStorage';
import { StorageService } from './storage';

export const RETENTION_DAYS = 30;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

class TrashServiceManager {
  /**
   * Retrieves all trashed items (Photos, PDFs, Chapters) across the entire account
   */
  async getTrashedItems(userId: string): Promise<TrashedItem[]> {
    const allItems: TrashedItem[] = [];
    const now = Date.now();

    // 1. Fetch Subjects & Chapters for location lookup
    const allSubjects = StorageService.getSubjects(userId);
    const subjectMap = new Map(allSubjects.map((s) => [s.id, s.name]));

    const allChapters = StorageService.getChapters(userId);
    const chapterMap = new Map(allChapters.map((c) => [c.id, c]));

    // 2. Fetch Trashed Photos
    const trashedPhotos = await PhotoStorageService.getTrashedPhotos(userId);
    for (const photo of trashedPhotos) {
      const deletedAt = photo.deletedAt || now;
      const trashUntil = photo.trashUntil || deletedAt + RETENTION_MS;
      const daysRemaining = Math.max(0, Math.ceil((trashUntil - now) / (24 * 60 * 60 * 1000)));

      const parentChapter = chapterMap.get(photo.chapterId);
      const subjectName = parentChapter ? subjectMap.get(parentChapter.subjectId) || 'Subject' : 'Subject';
      const chapterTitle = parentChapter ? `Ch. ${parentChapter.chapterNumber}: ${parentChapter.title}` : 'Chapter';

      allItems.push({
        id: photo.id,
        type: 'photo',
        title: `Board Snapshot #${photo.orderIndex || 1}`,
        subtitle: `Captured ${new Date(photo.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
        locationPath: `${subjectName} → ${chapterTitle}`,
        thumbnailUrl: photo.thumbnailUrl || photo.localDataUrl,
        deletedAt,
        trashUntil,
        daysRemaining,
        originalItem: photo,
        sizeBytes: photo.fileSizeBytes,
      });
    }

    // 3. Fetch Trashed PDFs
    const trashedPdfs = await PDFStorageService.getTrashedPDFs(userId);
    for (const pdf of trashedPdfs) {
      const deletedAt = pdf.deletedAt || now;
      const trashUntil = pdf.trashUntil || deletedAt + RETENTION_MS;
      const daysRemaining = Math.max(0, Math.ceil((trashUntil - now) / (24 * 60 * 60 * 1000)));

      allItems.push({
        id: pdf.id,
        type: 'pdf',
        title: pdf.title,
        subtitle: `${pdf.pageCount} ${pdf.pageCount === 1 ? 'Page' : 'Pages'} • ${pdf.photoCount} Photos`,
        locationPath: `${pdf.subjectName} → ${pdf.chapterTitle}`,
        deletedAt,
        trashUntil,
        daysRemaining,
        originalItem: pdf,
        sizeBytes: pdf.fileSizeBytes,
      });
    }

    // 4. Fetch Trashed Chapters
    const trashedChapters = StorageService.getTrashedChapters(userId);
    for (const chap of trashedChapters) {
      const deletedAt = chap.deletedAt || now;
      const trashUntil = chap.trashUntil || deletedAt + RETENTION_MS;
      const daysRemaining = Math.max(0, Math.ceil((trashUntil - now) / (24 * 60 * 60 * 1000)));
      const subjectName = subjectMap.get(chap.subjectId) || 'Subject';

      allItems.push({
        id: chap.id,
        type: 'chapter',
        title: `Ch. ${chap.chapterNumber}: ${chap.title}`,
        subtitle: `${chap.photoCount} board snapshots`,
        locationPath: subjectName,
        deletedAt,
        trashUntil,
        daysRemaining,
        originalItem: chap,
        childCount: chap.photoCount,
      });
    }

    // Sort by deletedAt descending (most recently deleted at top)
    return allItems.sort((a, b) => b.deletedAt - a.deletedAt);
  }

  /**
   * Restores a single item by type and ID
   */
  async restoreItem(userId: string, type: TrashItemType, id: string): Promise<{ success: boolean; message: string }> {
    try {
      if (type === 'photo') {
        const restored = await PhotoStorageService.restorePhoto(userId, id);
        if (!restored) return { success: false, message: 'Photo not found in Trash' };
        return { success: true, message: 'Board photo restored to its original chapter' };
      }

      if (type === 'pdf') {
        const restored = await PDFStorageService.restorePDF(userId, id);
        if (!restored) return { success: false, message: 'PDF document not found in Trash' };
        return { success: true, message: 'Study PDF restored to My PDFs' };
      }

      if (type === 'chapter') {
        const restored = StorageService.restoreChapter(userId, id);
        if (!restored) return { success: false, message: 'Chapter not found in Trash' };

        // Also cascade restore any photos belonging to this chapter
        const chapterPhotos = await PhotoStorageService.getTrashedPhotos(userId);
        const relatedPhotos = chapterPhotos.filter((p) => p.chapterId === id);
        for (const p of relatedPhotos) {
          await PhotoStorageService.restorePhoto(userId, p.id);
        }

        return { success: true, message: 'Chapter and its board snapshots restored successfully' };
      }

      return { success: false, message: 'Unknown item type' };
    } catch (e: any) {
      console.error('Error during item restoration', e);
      return { success: false, message: e.message || 'Failed to restore item' };
    }
  }

  /**
   * Permanently deletes a single item
   */
  async permanentlyDeleteItem(userId: string, type: TrashItemType, id: string): Promise<void> {
    if (type === 'photo') {
      await PhotoStorageService.permanentlyDeletePhoto(userId, id);
    } else if (type === 'pdf') {
      await PDFStorageService.permanentlyDeletePDF(userId, id);
    } else if (type === 'chapter') {
      StorageService.permanentlyDeleteChapter(userId, id);
      // Permanently purge any photos associated with this deleted chapter
      const chapterPhotos = await PhotoStorageService.getTrashedPhotos(userId);
      const relatedPhotos = chapterPhotos.filter((p) => p.chapterId === id);
      for (const p of relatedPhotos) {
        await PhotoStorageService.permanentlyDeletePhoto(userId, p.id);
      }
    }
  }

  /**
   * Restores multiple items in batch
   */
  async restoreBulk(userId: string, items: { type: TrashItemType; id: string }[]): Promise<number> {
    let successCount = 0;
    for (const item of items) {
      const res = await this.restoreItem(userId, item.type, item.id);
      if (res.success) successCount++;
    }
    return successCount;
  }

  /**
   * Permanently deletes multiple items in batch
   */
  async permanentlyDeleteBulk(userId: string, items: { type: TrashItemType; id: string }[]): Promise<number> {
    let count = 0;
    for (const item of items) {
      await this.permanentlyDeleteItem(userId, item.type, item.id);
      count++;
    }
    return count;
  }

  /**
   * Empties the entire Trash vault permanently
   */
  async emptyTrash(userId: string): Promise<number> {
    const items = await this.getTrashedItems(userId);
    for (const item of items) {
      await this.permanentlyDeleteItem(userId, item.type, item.id);
    }
    return items.length;
  }

  /**
   * Automatically sweeps and permanently purges items older than 30 days
   */
  async purgeAllExpiredItems(userId: string): Promise<{ photos: number; pdfs: number; chapters: number }> {
    const photosPurged = await PhotoStorageService.purgeExpiredPhotos(userId, RETENTION_DAYS);
    const pdfsPurged = await PDFStorageService.purgeExpiredPDFs(userId, RETENTION_DAYS);
    const chaptersPurged = StorageService.purgeExpiredChapters(userId, RETENTION_DAYS);

    if (photosPurged > 0 || pdfsPurged > 0 || chaptersPurged > 0) {
      console.log(`[Auto-Retention] Cleaned up expired items: ${photosPurged} photos, ${pdfsPurged} PDFs, ${chaptersPurged} chapters`);
    }

    return {
      photos: photosPurged,
      pdfs: pdfsPurged,
      chapters: chaptersPurged,
    };
  }

  /**
   * Time-travel helper for developer & interactive simulation
   */
  async simulateTimeTravel(userId: string, daysForward: number): Promise<void> {
    await PhotoStorageService.simulateTimeTravel(userId, daysForward);
    await PDFStorageService.simulateTimeTravel(userId, daysForward);
    StorageService.simulateTimeTravelChapters(userId, daysForward);
  }
}

export const TrashService = new TrashServiceManager();
