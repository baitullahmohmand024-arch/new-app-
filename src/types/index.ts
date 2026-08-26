/**
 * Easy Study Snap - Core Type Definitions
 * Phase 3: Authentication & Student Account Foundation
 */

export type AcademicFieldType =
  | 'Pre-Engineering'
  | 'Medical'
  | 'Computer Science'
  | 'Humanities'
  | 'Commerce'
  | 'Custom';

export type FieldIconName =
  | 'GraduationCap'
  | 'Atom'
  | 'Dna'
  | 'Calculator'
  | 'Code'
  | 'BookOpen'
  | 'Briefcase'
  | 'Palette'
  | 'Compass';

export type SubjectIconName =
  | 'Calculator'
  | 'Atom'
  | 'Dna'
  | 'BookOpen'
  | 'Code'
  | 'Layers'
  | 'Compass'
  | 'Briefcase'
  | 'Palette'
  | 'GraduationCap';

export type ColorTheme = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';

export interface UserProfile {
  id: string; // Unique student identifier (e.g. "usr_google_582910")
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: 'google';
  createdAt: number;
  lastLoginAt: number;
  selectedFieldId: string;
  hasSelectedInitialField?: boolean;
  isAccountActive: boolean;
  fatherName?: string;
  grade?: string;
  rollNumber?: string;
  fieldOfStudy?: string;
  isProfileSetupComplete?: boolean;
}

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'waiting_for_network' | 'error';

export interface SyncProgress {
  status: SyncStatus;
  totalPending: number;
  syncedCount: number;
  currentEntity?: string;
  isOnline: boolean;
  lastSyncedAt: number | null;
  lastError?: string | null;
}

export interface SyncQueueItem {
  id: string;
  userId: string;
  entityType: 'field' | 'subject' | 'chapter' | 'photo' | 'pdf';
  entityId: string;
  action: 'upsert' | 'delete';
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface AcademicField {
  id: string;
  userId?: string; // Student ID who owns this custom field
  name: string;
  description: string;
  isCustom?: boolean;
  iconName?: FieldIconName;
  colorTheme?: ColorTheme;
  orderIndex?: number;
  createdAt?: number;
  updatedAt?: number;
  isDeleted?: boolean;
  deletedAt?: number;
  trashUntil?: number;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface Subject {
  id: string;
  userId: string; // User data isolation
  fieldId: string;
  name: string;
  iconName: SubjectIconName;
  colorTheme: ColorTheme;
  chapterCount: number;
  photoCount: number;
  orderIndex?: number;
  isCustom?: boolean;
  createdAt: number;
  updatedAt?: number;
  isDeleted?: boolean;
  deletedAt?: number;
  trashUntil?: number;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface Chapter {
  id: string;
  userId: string; // User data isolation
  subjectId: string;
  chapterNumber: number;
  orderIndex: number;
  title: string;
  isCompleted: boolean;
  photoCount: number;
  pdfGenerated: boolean;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  deletedAt?: number;
  trashUntil?: number;
  syncStatus?: 'synced' | 'pending' | 'failed';
}

export interface BoardPhoto {
  id: string;
  userId: string; // User data isolation
  chapterId: string;
  orderIndex: number;
  localDataUrl: string;
  originalDataUrl?: string; // Stored to allow "Restore Original" at any time
  thumbnailUrl?: string;
  cloudUrl?: string;
  width: number;
  height: number;
  rotation: number;
  brightness?: number; // Normalized -50 to +50
  contrast?: number; // Normalized -50 to +50
  filterMode: 'normal' | 'document' | 'high_contrast' | 'blackboard';
  syncStatus: 'synced' | 'pending' | 'syncing' | 'failed';
  source?: 'camera' | 'gallery';
  fileName?: string;
  fileSizeBytes?: number;
  createdAt: number;
  updatedAt?: number;
  lastSyncedAt?: number;
  isDeleted: boolean;
  deletedAt?: number;
  trashUntil?: number;
}

export interface StudyPDF {
  id: string;
  userId: string; // User data isolation
  fieldId: string;
  fieldName: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  chapterNumber?: number;
  title: string;
  fileName: string;
  pageCount: number;
  photoCount: number;
  fileSizeBytes: number;
  photoIds: string[]; // Source tracking for detecting when new photos are added
  creatorName: string;
  localBlobUrl?: string;
  pdfDataUrl?: string; // Base64 or Blob storage for offline reading
  cloudUrl?: string;
  createdAt: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
  isDeleted?: boolean;
  deletedAt?: number;
  trashUntil?: number;
}

export type TrashItemType = 'photo' | 'pdf' | 'chapter';

export interface TrashedItem {
  id: string;
  type: TrashItemType;
  title: string;
  subtitle: string;
  locationPath: string;
  thumbnailUrl?: string;
  deletedAt: number;
  trashUntil: number;
  daysRemaining: number;
  originalItem: BoardPhoto | StudyPDF | Chapter;
  sizeBytes?: number;
  childCount?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  isDarkMode: boolean;
  themeMode?: ThemeMode;
  isOfflineMode: boolean;
  storageUsageBytes: number;
  syncOnMobileData: boolean;
  autoSyncEnabled: boolean;
  simulatedDeviceId: string;
}

export type NavigationTab = 'study' | 'teacher' | 'pdfs' | 'search' | 'trash' | 'profile';

export type AITeacherStudyMode =
  | 'learn_concept'
  | 'practice_mcqs'
  | 'tricky_mcqs'
  | 'exam_practice'
  | 'rapid_revision'
  | 'weak_area_practice';

export type MCQDifficulty = 'foundation' | 'conceptual' | 'tricky' | 'exam_challenge';
export type MCQOption = 'A' | 'B' | 'C' | 'D';

export interface MCQQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: MCQOption;
  explanation: string;
  whyTemptingMap?: Record<MCQOption, string>;
  keyIdea: string;
  examTrap?: string;
  difficulty: MCQDifficulty;
  topic: string;
  userAnswer?: MCQOption;
  isAnswered?: boolean;
  isCorrect?: boolean;
  answeredAt?: number;
}

export interface AITeacherMessage {
  id: string;
  sender: 'user' | 'teacher';
  text: string;
  timestamp: number;
  studyMode?: AITeacherStudyMode;
  mcqQuestion?: MCQQuestion;
  isError?: boolean;
}

export interface AITeacherMistakeRecord {
  questionId: string;
  question: string;
  chosen: MCQOption;
  correct: MCQOption;
  topic: string;
  keyIdea: string;
  timestamp: number;
}

export interface AITeacherSessionStats {
  questionsAttempted: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  topicsPracticed: string[];
  weakConcepts: string[];
  mistakes: AITeacherMistakeRecord[];
}

export interface AITeacherContext {
  fieldId?: string;
  fieldName?: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
}

export interface AITeacherChatSession {
  id: string;
  userId: string;
  title: string;
  context?: AITeacherContext;
  messages: AITeacherMessage[];
  stats: AITeacherSessionStats;
  createdAt: number;
  updatedAt: number;
}

export type SearchResultType = 'field' | 'subject' | 'chapter' | 'pdf';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  locationPath: string; // e.g. "Pre-Engineering › Mathematics › Chapter 1"
  fieldId: string;
  fieldName: string;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterTitle?: string;
  chapterNumber?: number;
  pdfId?: string;
  pdfPageCount?: number;
  photoCount?: number;
  isCompleted?: boolean;
  score?: number;
  updatedAt: number;
}

export interface RecentOpenedChapter {
  chapterId: string;
  subjectId: string;
  fieldId: string;
  chapterTitle: string;
  chapterNumber: number;
  subjectName: string;
  fieldName: string;
  photoCount: number;
  openedAt: number;
}

