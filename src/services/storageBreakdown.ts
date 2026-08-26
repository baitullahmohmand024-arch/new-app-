/**
 * Easy Study Snap - Storage Breakdown Service (Phase 14)
 * Calculates accurate on-device storage footprint across Board Photos, Study PDFs, and Chapter metadata
 */

import { PhotoStorageService } from './photoStorage';
import { PDFStorageService } from './pdfStorage';
import { StorageService } from './storage';

export interface StorageUsageStats {
  totalBytes: number;
  photosBytes: number;
  pdfsBytes: number;
  metadataBytes: number;
  photoCount: number;
  pdfCount: number;
  chapterCount: number;
  subjectCount: number;
  formattedTotal: string;
  formattedPhotos: string;
  formattedPdfs: string;
  formattedMetadata: string;
}

export function formatByteSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const StorageBreakdownService = {
  /**
   * Computes exact storage footprint for a specific student account
   */
  async calculateStorageUsage(userId: string): Promise<StorageUsageStats> {
    try {
      // 1. Calculate Photo Storage
      const activePhotos = await PhotoStorageService.getAllActivePhotos(userId);
      let photosBytes = 0;
      for (const photo of activePhotos) {
        if (photo.fileSizeBytes && photo.fileSizeBytes > 0) {
          photosBytes += photo.fileSizeBytes;
        } else if (photo.localDataUrl) {
          // Estimate base64 length in bytes: (length * 3/4)
          photosBytes += Math.round(photo.localDataUrl.length * 0.75);
        }
      }

      // 2. Calculate PDF Storage
      const activePdfs = await PDFStorageService.getPDFsByUser(userId);
      let pdfsBytes = 0;
      for (const pdf of activePdfs) {
        if (pdf.fileSizeBytes && pdf.fileSizeBytes > 0) {
          pdfsBytes += pdf.fileSizeBytes;
        } else if (pdf.pdfDataUrl) {
          pdfsBytes += Math.round(pdf.pdfDataUrl.length * 0.75);
        }
      }

      // 3. Calculate Metadata Storage (Subjects, Chapters, Fields in LocalStorage)
      const subjects = StorageService.getSubjects(userId);
      const chapters = StorageService.getChapters(userId);
      const fields = StorageService.getFields(userId);

      const metadataString = JSON.stringify({ subjects, chapters, fields });
      const metadataBytes = new Blob([metadataString]).size;

      const totalBytes = photosBytes + pdfsBytes + metadataBytes;

      return {
        totalBytes,
        photosBytes,
        pdfsBytes,
        metadataBytes,
        photoCount: activePhotos.length,
        pdfCount: activePdfs.length,
        chapterCount: chapters.filter((c) => !c.isDeleted).length,
        subjectCount: subjects.filter((s) => !s.isDeleted).length,
        formattedTotal: formatByteSize(totalBytes),
        formattedPhotos: formatByteSize(photosBytes),
        formattedPdfs: formatByteSize(pdfsBytes),
        formattedMetadata: formatByteSize(metadataBytes),
      };
    } catch (e) {
      console.warn('Could not calculate exact storage breakdown, using fallback', e);
      return {
        totalBytes: 0,
        photosBytes: 0,
        pdfsBytes: 0,
        metadataBytes: 0,
        photoCount: 0,
        pdfCount: 0,
        chapterCount: 0,
        subjectCount: 0,
        formattedTotal: '0 KB',
        formattedPhotos: '0 KB',
        formattedPdfs: '0 KB',
        formattedMetadata: '0 KB',
      };
    }
  },
};
