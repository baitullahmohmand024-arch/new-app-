/**
 * Easy Study Snap - Global Search & Smart Organization Engine (Phase 12)
 *
 * Fast, deterministic, offline-first search across:
 * - Academic Fields / Classes
 * - Subjects
 * - Chapters
 * - PDFs
 *
 * Excludes trashed/deleted content and maintains strict user data isolation.
 */

import {
  AcademicField,
  Subject,
  Chapter,
  StudyPDF,
  BoardPhoto,
  SearchResultItem,
  SearchResultType,
  RecentOpenedChapter,
} from '../types';
import { StorageService } from './storage';
import { PDFStorageService } from './pdfStorage';
import { PhotoStorageService } from './photoStorage';

const STORAGE_KEYS = {
  RECENT_CHAPTERS_PREFIX: 'easy_study_snap_recent_chapters_',
};

export class GlobalSearchService {
  /**
   * Records a chapter opening to recent history for quick access
   */
  recordChapterOpened(
    userId: string,
    chapter: Chapter,
    subject: Subject,
    field: AcademicField
  ): void {
    if (!userId || !chapter || !subject || !field) return;

    try {
      const key = `${STORAGE_KEYS.RECENT_CHAPTERS_PREFIX}${userId}`;
      const existingRaw = localStorage.getItem(key);
      let list: RecentOpenedChapter[] = existingRaw ? JSON.parse(existingRaw) : [];

      // Filter out existing occurrence of this chapter
      list = list.filter((item) => item.chapterId !== chapter.id);

      // Add to front
      const entry: RecentOpenedChapter = {
        chapterId: chapter.id,
        subjectId: subject.id,
        fieldId: field.id,
        chapterTitle: chapter.title,
        chapterNumber: chapter.chapterNumber,
        subjectName: subject.name,
        fieldName: field.name,
        photoCount: chapter.photoCount || 0,
        openedAt: Date.now(),
      };

      list.unshift(entry);

      // Cap at 10 recent items
      if (list.length > 10) {
        list = list.slice(0, 10);
      }

      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to record recent chapter access', e);
    }
  }

  /**
   * Retrieves recently opened chapters, cross-verifying that neither the chapter
   * nor subject is deleted or in trash.
   */
  getRecentlyOpenedChapters(userId: string, limit = 5): RecentOpenedChapter[] {
    if (!userId) return [];

    try {
      const key = `${STORAGE_KEYS.RECENT_CHAPTERS_PREFIX}${userId}`;
      const existingRaw = localStorage.getItem(key);
      if (!existingRaw) return [];

      const list: RecentOpenedChapter[] = JSON.parse(existingRaw);

      // Cross-verify with active chapters in storage
      const activeChapters = StorageService.getChapters(userId).filter((c) => !c.isDeleted);
      const activeChapterIds = new Set(activeChapters.map((c) => c.id));

      const activeSubjects = StorageService.getSubjects(userId).filter((s) => !s.isDeleted);
      const activeSubjectIds = new Set(activeSubjects.map((s) => s.id));

      const verified = list.filter(
        (item) => activeChapterIds.has(item.chapterId) && activeSubjectIds.has(item.subjectId)
      );

      return verified.slice(0, limit);
    } catch (e) {
      console.warn('Failed to retrieve recent chapters', e);
      return [];
    }
  }

  /**
   * Retrieves recently captured active photos for the empty search state
   */
  async getRecentlyCapturedPhotos(
    userId: string,
    limit = 6
  ): Promise<{ photo: BoardPhoto; chapterTitle?: string; subjectName?: string; fieldId?: string }[]> {
    if (!userId) return [];

    try {
      const photos = await PhotoStorageService.getAllActivePhotos(userId);
      const chapters = StorageService.getChapters(userId).filter((c) => !c.isDeleted);
      const chapterMap = new Map(chapters.map((c) => [c.id, c]));

      const subjects = StorageService.getSubjects(userId).filter((s) => !s.isDeleted);
      const subjectMap = new Map(subjects.map((s) => [s.id, s]));

      const results: { photo: BoardPhoto; chapterTitle?: string; subjectName?: string; fieldId?: string }[] = [];

      for (const photo of photos.slice(0, limit * 2)) {
        const chap = chapterMap.get(photo.chapterId);
        if (chap) {
          const subj = subjectMap.get(chap.subjectId);
          results.push({
            photo,
            chapterTitle: chap.title,
            subjectName: subj?.name,
            fieldId: subj?.fieldId,
          });
        }
        if (results.length >= limit) break;
      }

      return results;
    } catch (e) {
      console.warn('Failed to retrieve recently captured photos', e);
      return [];
    }
  }

  /**
   * Retrieves recent non-deleted study PDFs
   */
  async getRecentPDFs(userId: string, limit = 4): Promise<StudyPDF[]> {
    if (!userId) return [];
    try {
      const pdfs = await PDFStorageService.getPDFsByUser(userId);
      return pdfs.filter((p) => !p.isDeleted).slice(0, limit);
    } catch (e) {
      console.warn('Failed to retrieve recent PDFs', e);
      return [];
    }
  }

  /**
   * Executes deterministic, multi-attribute search across the student's study vault
   */
  async search(
    userId: string,
    rawQuery: string,
    filterType: 'all' | 'field' | 'subject' | 'chapter' | 'pdf' = 'all',
    contextFilter?: { fieldId?: string; subjectId?: string }
  ): Promise<SearchResultItem[]> {
    if (!userId) return [];

    const query = rawQuery.trim().toLowerCase();
    if (!query) return [];

    // Tokenize query words for flexible multi-word matching
    const queryTokens = query.split(/\s+/).filter(Boolean);

    // 1. Fetch user-isolated active data
    const fields = StorageService.getFields(userId).filter((f) => !f.isDeleted);
    const fieldMap = new Map(fields.map((f) => [f.id, f]));

    const subjects = StorageService.getSubjects(userId).filter((s) => !s.isDeleted);
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const chapters = StorageService.getChapters(userId).filter((c) => !c.isDeleted);

    let pdfs: StudyPDF[] = [];
    try {
      pdfs = await PDFStorageService.getPDFsByUser(userId);
      pdfs = pdfs.filter((p) => !p.isDeleted);
    } catch (e) {
      console.warn('PDF retrieval failed during search', e);
    }

    const results: SearchResultItem[] = [];

    // 2. Search Fields
    if (filterType === 'all' || filterType === 'field') {
      for (const field of fields) {
        if (contextFilter?.fieldId && field.id !== contextFilter.fieldId) continue;

        const fieldNameLower = field.name.toLowerCase();
        const fieldDescLower = (field.description || '').toLowerCase();

        const matchesName = this.tokensMatchText(queryTokens, fieldNameLower);
        const matchesDesc = this.tokensMatchText(queryTokens, fieldDescLower);

        if (matchesName || matchesDesc) {
          let score = 10;
          if (fieldNameLower === query) score += 100;
          else if (fieldNameLower.startsWith(query)) score += 60;
          else if (fieldNameLower.includes(query)) score += 40;

          const fieldSubjCount = subjects.filter((s) => s.fieldId === field.id).length;

          results.push({
            id: `res_field_${field.id}`,
            type: 'field',
            title: field.name,
            subtitle: field.description || `${fieldSubjCount} Subjects in this Track`,
            locationPath: `Field Track: ${field.name}`,
            fieldId: field.id,
            fieldName: field.name,
            score,
            updatedAt: field.updatedAt || field.createdAt || Date.now(),
          });
        }
      }
    }

    // 3. Search Subjects
    if (filterType === 'all' || filterType === 'subject') {
      for (const subject of subjects) {
        if (contextFilter?.fieldId && subject.fieldId !== contextFilter.fieldId) continue;
        if (contextFilter?.subjectId && subject.id !== contextFilter.subjectId) continue;

        const field = fieldMap.get(subject.fieldId);
        const fieldName = field?.name || 'General Field';

        const subjectNameLower = subject.name.toLowerCase();
        const matchesName = this.tokensMatchText(queryTokens, subjectNameLower);
        const matchesField = this.tokensMatchText(queryTokens, fieldName.toLowerCase());

        if (matchesName || matchesField) {
          let score = 15;
          if (subjectNameLower === query) score += 110;
          else if (subjectNameLower.startsWith(query)) score += 70;
          else if (subjectNameLower.includes(query)) score += 45;

          const subjectChapters = chapters.filter((c) => c.subjectId === subject.id);
          const totalPhotos = subjectChapters.reduce((acc, c) => acc + (c.photoCount || 0), 0);

          results.push({
            id: `res_subj_${subject.id}`,
            type: 'subject',
            title: subject.name,
            subtitle: `${subjectChapters.length} Chapters • ${totalPhotos} Board Photos`,
            locationPath: `${fieldName} › ${subject.name}`,
            fieldId: subject.fieldId,
            fieldName,
            subjectId: subject.id,
            subjectName: subject.name,
            photoCount: totalPhotos,
            score,
            updatedAt: subject.updatedAt || subject.createdAt || Date.now(),
          });
        }
      }
    }

    // 4. Search Chapters
    if (filterType === 'all' || filterType === 'chapter') {
      for (const chapter of chapters) {
        const subject = subjectMap.get(chapter.subjectId);
        if (!subject) continue;

        if (contextFilter?.fieldId && subject.fieldId !== contextFilter.fieldId) continue;
        if (contextFilter?.subjectId && subject.id !== contextFilter.subjectId) continue;

        const field = fieldMap.get(subject.fieldId);
        const fieldName = field?.name || 'General Field';
        const chapterTitleLower = chapter.title.toLowerCase();
        const chapterNumStr = `chapter ${chapter.chapterNumber} ch ${chapter.chapterNumber} ${chapter.chapterNumber}`;

        const matchesTitle = this.tokensMatchText(queryTokens, chapterTitleLower);
        const matchesSubject = this.tokensMatchText(queryTokens, subject.name.toLowerCase());
        const matchesField = this.tokensMatchText(queryTokens, fieldName.toLowerCase());
        const matchesNumber = queryTokens.some((t) => chapterNumStr.includes(t));

        if (matchesTitle || matchesSubject || matchesField || matchesNumber) {
          let score = 20;
          if (chapterTitleLower === query) score += 120;
          else if (chapterTitleLower.startsWith(query)) score += 80;
          else if (chapterTitleLower.includes(query)) score += 50;
          else if (matchesSubject) score += 25;
          if (matchesNumber) score += 15;

          results.push({
            id: `res_chap_${chapter.id}`,
            type: 'chapter',
            title: chapter.title,
            subtitle: `Chapter ${chapter.chapterNumber} • ${chapter.photoCount || 0} Photos${
              chapter.isCompleted ? ' • Completed' : ''
            }`,
            locationPath: `${fieldName} › ${subject.name} › Chapter ${chapter.chapterNumber}`,
            fieldId: subject.fieldId,
            fieldName,
            subjectId: subject.id,
            subjectName: subject.name,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            chapterNumber: chapter.chapterNumber,
            photoCount: chapter.photoCount || 0,
            isCompleted: chapter.isCompleted,
            score,
            updatedAt: chapter.updatedAt || chapter.createdAt || Date.now(),
          });
        }
      }
    }

    // 5. Search PDFs
    if (filterType === 'all' || filterType === 'pdf') {
      for (const pdf of pdfs) {
        if (contextFilter?.fieldId && pdf.fieldId !== contextFilter.fieldId) continue;
        if (contextFilter?.subjectId && pdf.subjectId !== contextFilter.subjectId) continue;

        const pdfTitleLower = (pdf.title || '').toLowerCase();
        const fileNameLower = (pdf.fileName || '').toLowerCase();
        const chapterTitleLower = (pdf.chapterTitle || '').toLowerCase();
        const subjectNameLower = (pdf.subjectName || '').toLowerCase();
        const fieldNameLower = (pdf.fieldName || '').toLowerCase();

        const matchesTitle = this.tokensMatchText(queryTokens, pdfTitleLower);
        const matchesFile = this.tokensMatchText(queryTokens, fileNameLower);
        const matchesChap = this.tokensMatchText(queryTokens, chapterTitleLower);
        const matchesSubj = this.tokensMatchText(queryTokens, subjectNameLower);
        const matchesField = this.tokensMatchText(queryTokens, fieldNameLower);

        if (matchesTitle || matchesFile || matchesChap || matchesSubj || matchesField) {
          let score = 25;
          if (pdfTitleLower === query) score += 130;
          else if (pdfTitleLower.startsWith(query)) score += 85;
          else if (pdfTitleLower.includes(query)) score += 55;
          else if (matchesChap) score += 30;
          else if (matchesSubj) score += 20;

          const sizeKb = Math.round((pdf.fileSizeBytes || 0) / 1024);
          const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

          results.push({
            id: `res_pdf_${pdf.id}`,
            type: 'pdf',
            title: pdf.title || pdf.fileName,
            subtitle: `${pdf.pageCount || 1} Pages • ${pdf.photoCount || 0} Board Photos • ${sizeStr}`,
            locationPath: `${pdf.fieldName || 'Field'} › ${pdf.subjectName || 'Subject'} › ${
              pdf.chapterTitle || 'Chapter'
            }`,
            fieldId: pdf.fieldId,
            fieldName: pdf.fieldName,
            subjectId: pdf.subjectId,
            subjectName: pdf.subjectName,
            chapterId: pdf.chapterId,
            chapterTitle: pdf.chapterTitle,
            chapterNumber: pdf.chapterNumber,
            pdfId: pdf.id,
            pdfPageCount: pdf.pageCount,
            photoCount: pdf.photoCount,
            score,
            updatedAt: pdf.updatedAt || pdf.createdAt || Date.now(),
          });
        }
      }
    }

    // 6. Sort results: highest relevance score first, then newest updated
    return results.sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }

  /**
   * Helper to check if all tokens appear in target text
   */
  private tokensMatchText(tokens: string[], text: string): boolean {
    if (tokens.length === 0) return true;
    return tokens.every((token) => text.includes(token));
  }
}

export const SearchService = new GlobalSearchService();
