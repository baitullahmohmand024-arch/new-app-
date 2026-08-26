/**
 * Easy Study Snap - Local Storage Service
 * Phase 3: User Data Scoping & Offline-First Persistence
 */

import { AcademicField, Subject, Chapter, UserSettings } from '../types';
import { SyncService } from './syncEngine';

const STORAGE_KEYS = {
  SETTINGS: 'easy_study_snap_settings',
  FIELDS_PREFIX: 'easy_study_snap_fields_',
  SUBJECTS_PREFIX: 'easy_study_snap_subjects_',
  CHAPTERS_PREFIX: 'easy_study_snap_chapters_',
};

// Initial Seed Data for Academic Fields (Global template definitions)
export const DEFAULT_FIELDS: AcademicField[] = [
  {
    id: 'field_pre_med',
    name: 'Pre-Medical',
    description: 'Biology, Physics, Chemistry',
    iconName: 'Dna',
    colorTheme: 'emerald',
    isCustom: false,
    orderIndex: 0,
    syncStatus: 'synced',
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'field_pre_eng',
    name: 'Pre-Engineering',
    description: 'Mathematics, Physics, Chemistry',
    iconName: 'Calculator',
    colorTheme: 'blue',
    isCustom: false,
    orderIndex: 1,
    syncStatus: 'synced',
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'field_cs',
    name: 'Computer Science',
    description: 'Computer Science, Mathematics, Physics',
    iconName: 'Code',
    colorTheme: 'cyan',
    isCustom: false,
    orderIndex: 2,
    syncStatus: 'synced',
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'field_arts',
    name: 'Arts / Humanities',
    description: 'World History, Literature, Philosophy',
    iconName: 'BookOpen',
    colorTheme: 'violet',
    isCustom: false,
    orderIndex: 3,
    syncStatus: 'synced',
    updatedAt: Date.now() - 86400000 * 5,
  },
];

// Initial Seed Data Generator for a new student
export const generateDefaultSubjects = (userId: string): Subject[] => [
  // Pre-Medical Subjects
  {
    id: `sub_bio_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Biology',
    iconName: 'Dna',
    colorTheme: 'emerald',
    chapterCount: 4,
    photoCount: 18,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    syncStatus: 'synced',
  },
  {
    id: `sub_phys_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Physics',
    iconName: 'Atom',
    colorTheme: 'blue',
    chapterCount: 2,
    photoCount: 7,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    syncStatus: 'synced',
  },
  {
    id: `sub_chem_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Chemistry',
    iconName: 'Layers',
    colorTheme: 'amber',
    chapterCount: 3,
    photoCount: 12,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    syncStatus: 'synced',
  },

  // Pre-Engineering Subjects
  {
    id: `sub_math_${userId}`,
    userId,
    fieldId: 'field_pre_eng',
    name: 'Mathematics',
    iconName: 'Calculator',
    colorTheme: 'blue',
    chapterCount: 3,
    photoCount: 14,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    syncStatus: 'synced',
  },
  {
    id: `sub_phys_eng_${userId}`,
    userId,
    fieldId: 'field_pre_eng',
    name: 'Physics',
    iconName: 'Atom',
    colorTheme: 'emerald',
    chapterCount: 2,
    photoCount: 8,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    syncStatus: 'synced',
  },
  {
    id: `sub_chem_eng_${userId}`,
    userId,
    fieldId: 'field_pre_eng',
    name: 'Chemistry',
    iconName: 'Layers',
    colorTheme: 'amber',
    chapterCount: 2,
    photoCount: 6,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    syncStatus: 'synced',
  },

  // Computer Science Subjects
  {
    id: `sub_cs_cs_${userId}`,
    userId,
    fieldId: 'field_cs',
    name: 'Computer Science',
    iconName: 'Code',
    colorTheme: 'cyan',
    chapterCount: 3,
    photoCount: 15,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    syncStatus: 'synced',
  },
  {
    id: `sub_math_cs_${userId}`,
    userId,
    fieldId: 'field_cs',
    name: 'Mathematics',
    iconName: 'Calculator',
    colorTheme: 'blue',
    chapterCount: 2,
    photoCount: 9,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    syncStatus: 'synced',
  },
  {
    id: `sub_phys_cs_${userId}`,
    userId,
    fieldId: 'field_cs',
    name: 'Physics',
    iconName: 'Atom',
    colorTheme: 'emerald',
    chapterCount: 2,
    photoCount: 6,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    syncStatus: 'synced',
  },

  // Pre-Medical Subjects
  {
    id: `sub_bio_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Biology',
    iconName: 'Dna',
    colorTheme: 'emerald',
    chapterCount: 4,
    photoCount: 18,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    syncStatus: 'synced',
  },
  {
    id: `sub_phys_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Physics',
    iconName: 'Atom',
    colorTheme: 'blue',
    chapterCount: 2,
    photoCount: 7,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    syncStatus: 'synced',
  },
  {
    id: `sub_chem_pmed_${userId}`,
    userId,
    fieldId: 'field_pre_med',
    name: 'Chemistry',
    iconName: 'Layers',
    colorTheme: 'amber',
    chapterCount: 3,
    photoCount: 12,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    syncStatus: 'synced',
  },

  // Arts / Humanities Subjects
  {
    id: `sub_hist_arts_${userId}`,
    userId,
    fieldId: 'field_arts',
    name: 'World History',
    iconName: 'BookOpen',
    colorTheme: 'violet',
    chapterCount: 3,
    photoCount: 10,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    syncStatus: 'synced',
  },
  {
    id: `sub_lit_arts_${userId}`,
    userId,
    fieldId: 'field_arts',
    name: 'Literature',
    iconName: 'BookOpen',
    colorTheme: 'amber',
    chapterCount: 2,
    photoCount: 6,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    syncStatus: 'synced',
  },
  {
    id: `sub_phil_arts_${userId}`,
    userId,
    fieldId: 'field_arts',
    name: 'Philosophy',
    iconName: 'Compass',
    colorTheme: 'rose',
    chapterCount: 2,
    photoCount: 5,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    syncStatus: 'synced',
  },
];

export const generateDefaultChapters = (userId: string, mathSubjectId: string): Chapter[] => [
  {
    id: `chap_math_01_${userId}`,
    userId,
    subjectId: mathSubjectId,
    chapterNumber: 1,
    orderIndex: 0,
    title: 'Quadratic Equations & Complex Numbers',
    isCompleted: true,
    photoCount: 0,
    pdfGenerated: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
    isDeleted: false,
    syncStatus: 'synced',
  },
  {
    id: `chap_math_02_${userId}`,
    userId,
    subjectId: mathSubjectId,
    chapterNumber: 2,
    orderIndex: 1,
    title: 'Matrices & Determinants',
    isCompleted: false,
    photoCount: 0,
    pdfGenerated: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
    isDeleted: false,
    syncStatus: 'synced',
  },
  {
    id: `chap_math_03_${userId}`,
    userId,
    subjectId: mathSubjectId,
    chapterNumber: 3,
    orderIndex: 2,
    title: 'Trigonometric Functions & Graphs',
    isCompleted: false,
    photoCount: 0,
    pdfGenerated: false,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
    isDeleted: false,
    syncStatus: 'synced',
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  isDarkMode: false,
  themeMode: 'system',
  isOfflineMode: true,
  storageUsageBytes: 0,
  syncOnMobileData: true,
  autoSyncEnabled: true,
  simulatedDeviceId: 'device_phone_a',
};

export const StorageService = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to local storage', e);
    }
  },

  getFields(userId?: string): AcademicField[] {
    try {
      const key = userId ? `${STORAGE_KEYS.FIELDS_PREFIX}${userId}` : 'easy_study_snap_fields_default';
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Clone default fields for this user
      if (userId) {
        this.saveFields(userId, DEFAULT_FIELDS, false);
      }
      return DEFAULT_FIELDS;
    } catch {
      return DEFAULT_FIELDS;
    }
  },

  saveFields(userId: string, fields: AcademicField[], triggerSync = true): void {
    try {
      const key = `${STORAGE_KEYS.FIELDS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(fields));
      if (triggerSync) {
        SyncService.enqueueSync('field', userId);
      }
    } catch (e) {
      console.error('Failed to save fields to local storage', e);
    }
  },

  /**
   * Loads subjects strictly isolated by the student's unique userId
   */
  getSubjects(userId: string): Subject[] {
    try {
      const key = `${STORAGE_KEYS.SUBJECTS_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // First-time initialization for this student
      const initial = generateDefaultSubjects(userId);
      this.saveSubjects(userId, initial, false);
      return initial;
    } catch {
      return generateDefaultSubjects(userId);
    }
  },

  saveSubjects(userId: string, subjects: Subject[], triggerSync = true): void {
    try {
      const key = `${STORAGE_KEYS.SUBJECTS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(subjects));
      if (triggerSync) {
        SyncService.enqueueSync('subject', userId);
      }
    } catch (e) {
      console.error('Failed to save user subjects', e);
    }
  },

  /**
   * Loads chapters strictly isolated by the student's unique userId
   */
  getChapters(userId: string, mathSubjectId?: string): Chapter[] {
    try {
      const key = `${STORAGE_KEYS.CHAPTERS_PREFIX}${userId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      const initial = generateDefaultChapters(userId, mathSubjectId || `sub_math_${userId}`);
      this.saveChapters(userId, initial, false);
      return initial;
    } catch {
      return generateDefaultChapters(userId, mathSubjectId || `sub_math_${userId}`);
    }
  },

  saveChapters(userId: string, chapters: Chapter[], triggerSync = true): void {
    try {
      const key = `${STORAGE_KEYS.CHAPTERS_PREFIX}${userId}`;
      localStorage.setItem(key, JSON.stringify(chapters));
      if (triggerSync) {
        SyncService.enqueueSync('chapter', userId);
      }
    } catch (e) {
      console.error('Failed to save user chapters', e);
    }
  },

  updateChapter(userId: string, chapterId: string, updates: Partial<Chapter>): void {
    try {
      const chapters = this.getChapters(userId);
      const updated = chapters.map((c) =>
        c.id === chapterId ? { ...c, ...updates, updatedAt: Date.now() } : c
      );
      this.saveChapters(userId, updated);
    } catch (e) {
      console.error('Failed to update chapter in storage', e);
    }
  },

  /**
   * Moves a chapter to Trash (30-day recovery vault)
   */
  moveChapterToTrash(userId: string, chapterId: string): void {
    try {
      const chapters = this.getChapters(userId);
      const now = Date.now();
      const updated = chapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              isDeleted: true,
              deletedAt: now,
              trashUntil: now + 30 * 24 * 60 * 60 * 1000,
              updatedAt: now,
              syncStatus: 'pending' as const,
            }
          : c
      );
      this.saveChapters(userId, updated, true);
    } catch (e) {
      console.error('Failed to move chapter to trash', e);
    }
  },

  /**
   * Retrieves all trashed chapters for a user
   */
  getTrashedChapters(userId: string): Chapter[] {
    try {
      const chapters = this.getChapters(userId);
      return chapters
        .filter((c) => c.isDeleted)
        .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
    } catch {
      return [];
    }
  },

  /**
   * Restores a trashed chapter back to active state
   */
  restoreChapter(userId: string, chapterId: string): Chapter | null {
    try {
      const chapters = this.getChapters(userId);
      const target = chapters.find((c) => c.id === chapterId);
      if (!target) return null;

      const now = Date.now();
      const updated = chapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              isDeleted: false,
              deletedAt: undefined,
              trashUntil: undefined,
              updatedAt: now,
              syncStatus: 'pending' as const,
            }
          : c
      );
      this.saveChapters(userId, updated, true);
      return { ...target, isDeleted: false, deletedAt: undefined, trashUntil: undefined, updatedAt: now };
    } catch (e) {
      console.error('Failed to restore chapter', e);
      return null;
    }
  },

  /**
   * Permanently deletes a chapter record from storage
   */
  permanentlyDeleteChapter(userId: string, chapterId: string): void {
    try {
      const chapters = this.getChapters(userId);
      const filtered = chapters.filter((c) => c.id !== chapterId);
      this.saveChapters(userId, filtered, true);
    } catch (e) {
      console.error('Failed to permanently delete chapter', e);
    }
  },

  /**
   * Purges chapters older than 30 days
   */
  purgeExpiredChapters(userId: string, retentionDays = 30): number {
    try {
      const chapters = this.getChapters(userId);
      const now = Date.now();
      const expirationThresholdMs = retentionDays * 24 * 60 * 60 * 1000;

      let purgedCount = 0;
      const remaining: Chapter[] = [];

      for (const c of chapters) {
        if (c.isDeleted && c.deletedAt && now - c.deletedAt >= expirationThresholdMs) {
          purgedCount++;
        } else {
          remaining.push(c);
        }
      }

      if (purgedCount > 0) {
        this.saveChapters(userId, remaining, true);
      }
      return purgedCount;
    } catch {
      return 0;
    }
  },

  /**
   * Simulates moving time forward for test verification of chapter 30-day auto-purge
   */
  simulateTimeTravelChapters(userId: string, daysForward: number): void {
    try {
      const chapters = this.getChapters(userId);
      const offsetMs = daysForward * 24 * 60 * 60 * 1000;
      const updated = chapters.map((c) => {
        if (c.isDeleted && c.deletedAt) {
          const newDeletedAt = c.deletedAt - offsetMs;
          return {
            ...c,
            deletedAt: newDeletedAt,
            trashUntil: newDeletedAt + 30 * 24 * 60 * 60 * 1000,
          };
        }
        return c;
      });
      this.saveChapters(userId, updated, false);
    } catch (e) {
      console.error('Failed to simulate time travel on chapters', e);
    }
  },

  /**
   * Cleans up all data owned by a user when account is deleted
   */
  clearUserData(userId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.FIELDS_PREFIX}${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.SUBJECTS_PREFIX}${userId}`);
      localStorage.removeItem(`${STORAGE_KEYS.CHAPTERS_PREFIX}${userId}`);
      localStorage.removeItem(`easy_study_snap_search_history_${userId}`);
    } catch (e) {
      console.error('Failed to clear user data from storage', e);
    }
  },
};


