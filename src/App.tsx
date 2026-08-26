/**
 * Easy Study Snap - Main Application Shell
 * Phase 6: Board Camera Capture & Local Photo Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AcademicField,
  Subject,
  Chapter,
  BoardPhoto,
  NavigationTab,
  UserSettings,
  UserProfile,
  FieldIconName,
  SubjectIconName,
  ColorTheme,
  SyncProgress,
} from './types';
import { StorageService, generateDefaultSubjects } from './services/storage';
import { PhotoStorageService } from './services/photoStorage';
import { AuthService } from './services/auth';
import { SyncService } from './services/syncEngine';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { PlaceholderView } from './components/common/PlaceholderView';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { ProfileSetupScreen } from './components/profile/ProfileSetupScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { SubjectDetailView } from './components/subject/SubjectDetailView';
import { ChapterDetailView } from './components/chapter/ChapterDetailView';
import { BoardCameraView } from './components/camera/BoardCameraView';
import { PdfLibraryView } from './components/pdf/PdfLibraryView';
import { TrashView } from './components/trash/TrashView';
import { TrashService } from './services/trashService';
import { SearchView } from './components/search/SearchView';
import { SearchService } from './services/searchService';
import { SyncDetailModal } from './components/sync/SyncDetailModal';
import { AddCustomFieldModal } from './components/modals/AddCustomFieldModal';
import { EditFieldModal } from './components/modals/EditFieldModal';
import { DeleteFieldConfirmModal } from './components/modals/DeleteFieldConfirmModal';
import { AddSubjectModal } from './components/modals/AddSubjectModal';
import { EditSubjectModal } from './components/modals/EditSubjectModal';
import { DeleteSubjectConfirmModal } from './components/modals/DeleteSubjectConfirmModal';
import { AddChapterModal } from './components/modals/AddChapterModal';
import { EditChapterModal } from './components/modals/EditChapterModal';
import { DeleteChapterModal } from './components/modals/DeleteChapterModal';
import { QuickCaptureDestinationModal } from './components/modals/QuickCaptureDestinationModal';
import { AITeacherView } from './components/teacher/AITeacherView';
import { AITeacherContext, AITeacherStudyMode } from './types';
import { FileText, Trash2 } from 'lucide-react';

function MainApp() {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const user = AuthService.getCurrentUser();
    if (user && user.hasSelectedInitialField === undefined) {
      user.hasSelectedInitialField = Boolean(user.selectedFieldId);
    }
    return user;
  });

  // 2. Application Settings & Global Metadata
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());

  // 3. User-Scoped Academic Hierarchy (strictly isolated by currentUser.id)
  const [fields, setFields] = useState<AcademicField[]>(() =>
    StorageService.getFields(currentUser?.id)
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    currentUser ? StorageService.getSubjects(currentUser.id) : []
  );
  const [chapters, setChapters] = useState<Chapter[]>(() =>
    currentUser ? StorageService.getChapters(currentUser.id).filter((c) => !c.isDeleted) : []
  );

  // 4. Navigation & Active View State
  const [activeTab, setActiveTab] = useState<NavigationTab>('study');
  const [viewMode, setViewMode] = useState<'dashboard' | 'subject' | 'chapter'>('dashboard');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  // 5. Board Camera & Photo Management State (Phase 6)
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [chapterPhotos, setChapterPhotos] = useState<BoardPhoto[]>([]);

  // 6. Cloud Synchronization State (Phase 9)
  const [syncProgress, setSyncProgress] = useState<SyncProgress>(() => SyncService.getProgress());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 7. Field Modals State
  const [isAddCustomFieldOpen, setIsAddCustomFieldOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<AcademicField | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<AcademicField | null>(null);

  // 8. Subject Modals State
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // 9. Chapter Modals State
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<Chapter | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // 10. Quick Capture Destination Modal State (Phase 13)
  const [quickCaptureAction, setQuickCaptureAction] = useState<'camera' | 'import' | null>(null);

  // 11. AI Academic Teacher Context State
  const [teacherContext, setTeacherContext] = useState<AITeacherContext | undefined>(undefined);

  // Initialize & Listen for Supabase Authentication State & Google OAuth Hash Redirects
  useEffect(() => {
    AuthService.initAuthSession((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    const unsubscribe = AuthService.onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNavigateToTeacher = (mode?: AITeacherStudyMode) => {
    setTeacherContext({
      fieldId: currentField?.id,
      fieldName: currentField?.name,
      subjectId: activeSubject?.id,
      subjectName: activeSubject?.name,
      chapterId: activeChapter?.id,
      chapterTitle: activeChapter?.title,
      chapterNumber: activeChapter?.chapterNumber,
    });
    setActiveTab('teacher');
  };

  // Helper to refresh all user data
  const reloadAllData = useCallback(() => {
    if (currentUser) {
      const userFields = StorageService.getFields(currentUser.id);
      const userSubjects = StorageService.getSubjects(currentUser.id);
      const userChapters = StorageService.getChapters(currentUser.id).filter((c) => !c.isDeleted);
      const userSettings = StorageService.getSettings();
      setFields(userFields);
      setSubjects(userSubjects);
      setChapters(userChapters);
      setSettings(userSettings);

      if (activeChapter) {
        PhotoStorageService.getPhotosByChapter(currentUser.id, activeChapter.id).then(setChapterPhotos);
      }
    }
  }, [currentUser, activeChapter]);

  // Initial Startup 30-Day Auto Retention Sweep
  useEffect(() => {
    if (currentUser) {
      TrashService.purgeAllExpiredItems(currentUser.id).catch((e) =>
        console.warn('Automatic retention sweep error', e)
      );
    }
  }, [currentUser?.id]);

  // Sync Engine Lifecycle
  useEffect(() => {
    if (currentUser) {
      SyncService.init(currentUser.id);
      const unsubscribe = SyncService.subscribe((progress) => {
        setSyncProgress(progress);
        if (progress.status === 'synced') {
          // Refresh state after sync completes
          const userFields = StorageService.getFields(currentUser.id);
          const userSubjects = StorageService.getSubjects(currentUser.id);
          const userChapters = StorageService.getChapters(currentUser.id).filter((c) => !c.isDeleted);
          setFields(userFields);
          setSubjects(userSubjects);
          setChapters(userChapters);
        }
      });

      return () => {
        unsubscribe();
        SyncService.destroy();
      };
    } else {
      SyncService.destroy();
    }
  }, [currentUser?.id]);

  // When user signs in or changes, reload user-scoped data
  useEffect(() => {
    if (currentUser) {
      const userFields = StorageService.getFields(currentUser.id);
      const userSubjects = StorageService.getSubjects(currentUser.id);
      const mathSubject = userSubjects.find((s) => s.fieldId === 'field_pre_eng' && s.name.includes('Math'));
      const userChapters = StorageService.getChapters(currentUser.id, mathSubject?.id);
      setFields(userFields);
      setSubjects(userSubjects);
      setChapters(userChapters);
    } else {
      setFields(StorageService.getFields());
      setSubjects([]);
      setChapters([]);
      setChapterPhotos([]);
    }
  }, [currentUser?.id]);


  // Load photos whenever activeChapter changes
  const loadChapterPhotos = useCallback(async () => {
    if (currentUser && activeChapter) {
      const photos = await PhotoStorageService.getPhotosByChapter(currentUser.id, activeChapter.id);
      setChapterPhotos(photos);
    } else {
      setChapterPhotos([]);
    }
  }, [currentUser, activeChapter]);

  useEffect(() => {
    loadChapterPhotos();
  }, [loadChapterPhotos]);

  // Persist User-Scoped Fields
  useEffect(() => {
    if (currentUser && fields.length > 0) {
      StorageService.saveFields(currentUser.id, fields);
    }
  }, [fields, currentUser?.id]);

  // Persist User-Scoped Subjects
  useEffect(() => {
    if (currentUser) {
      StorageService.saveSubjects(currentUser.id, subjects);
    }
  }, [subjects, currentUser?.id]);

  // Persist User-Scoped Chapters
  useEffect(() => {
    if (currentUser) {
      StorageService.saveChapters(currentUser.id, chapters);
    }
  }, [chapters, currentUser?.id]);

  // Persist Settings
  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Handle Dark Mode DOM class
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  // Update Application Settings (Theme, Mode, etc.)
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
  };

  // Keyboard Shortcut listener for Quick Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setSettings((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async (email?: string, name?: string) => {
    const user = await AuthService.signInWithGoogle(email, name);
    setCurrentUser(user);
    setActiveTab('study');
    setViewMode('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
    setIsCameraOpen(false);
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    await AuthService.signOut();
    setCurrentUser(null);
    setActiveTab('study');
    setViewMode('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
    setIsCameraOpen(false);
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    await AuthService.deleteAccount(currentUser.id);
    setCurrentUser(null);
    setActiveTab('study');
    setViewMode('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
    setIsCameraOpen(false);
  };

  // Complete First-Time Student Profile Setup
  const handleCompleteProfileSetup = async (data: {
    name: string;
    fatherName: string;
    rollNumber?: string;
    avatarUrl?: string;
    selectedFieldId: string;
    fieldOfStudy: string;
    customFieldName?: string;
    customSubjects?: string[];
  }) => {
    if (!currentUser) return;

    let targetFieldId = data.selectedFieldId;

    // If Custom Field was created
    if (data.selectedFieldId === 'field_custom' && data.customFieldName) {
      const newFieldId = `field_custom_${Date.now()}_${currentUser.id.slice(0, 6)}`;
      const newField: AcademicField = {
        id: newFieldId,
        userId: currentUser.id,
        name: data.customFieldName,
        description: data.customSubjects?.join(' · ') || 'Custom Track Curriculum',
        iconName: 'GraduationCap',
        colorTheme: 'amber',
        isCustom: true,
        orderIndex: fields.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false,
        syncStatus: 'synced',
      };

      const updatedFields = [...fields, newField];
      setFields(updatedFields);
      StorageService.saveFields(currentUser.id, updatedFields);

      // Create custom subjects if provided
      if (data.customSubjects && data.customSubjects.length > 0) {
        const newSubjects: Subject[] = data.customSubjects.map((subName, idx) => ({
          id: `sub_${Date.now()}_${idx}_${currentUser.id.slice(0, 6)}`,
          userId: currentUser.id,
          fieldId: newFieldId,
          name: subName,
          iconName: 'BookOpen',
          colorTheme: idx % 2 === 0 ? 'blue' : 'emerald',
          chapterCount: 0,
          photoCount: 0,
          isCustom: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          syncStatus: 'synced',
        }));

        const existingUserSubjects = StorageService.getSubjects(currentUser.id);
        const updatedSubjects = [...existingUserSubjects, ...newSubjects];
        setSubjects(updatedSubjects);
        StorageService.saveSubjects(currentUser.id, updatedSubjects);
      }

      targetFieldId = newFieldId;
    } else {
      // Predefined Field: ensure user subjects are initialized & loaded with the correct subjects for the selected field
      let userSubjects = StorageService.getSubjects(currentUser.id);
      const fieldSubjects = userSubjects.filter((s) => s.fieldId === targetFieldId);
      if (fieldSubjects.length === 0) {
        const defaultAll = generateDefaultSubjects(currentUser.id);
        const defaultsForField = defaultAll.filter((s) => s.fieldId === targetFieldId);
        userSubjects = [...userSubjects, ...defaultsForField];
        StorageService.saveSubjects(currentUser.id, userSubjects);
      }
      setSubjects(userSubjects);
    }

    const updatedUser: UserProfile = {
      ...currentUser,
      name: data.name,
      fatherName: data.fatherName,
      rollNumber: data.rollNumber,
      avatarUrl: data.avatarUrl || currentUser.avatarUrl,
      selectedFieldId: targetFieldId,
      fieldOfStudy: data.fieldOfStudy,
      hasSelectedInitialField: true,
      isProfileSetupComplete: true,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updatedUser));
    localStorage.setItem('easy_study_snap_auth_user', JSON.stringify(updatedUser));

    setActiveTab('study');
    setViewMode('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
  };

  // Update Student Profile from Profile Screen
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updatedUser));
    localStorage.setItem('easy_study_snap_auth_user', JSON.stringify(updatedUser));
  };

  // Switch Active Academic Field Track
  const handleSelectField = (fieldId: string) => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        selectedFieldId: fieldId,
        hasSelectedInitialField: true,
      };
      setCurrentUser(updated);
      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(updated));
      localStorage.setItem('easy_study_snap_auth_user', JSON.stringify(updated));
    }
    setViewMode('dashboard');
    setActiveSubject(null);
    setActiveChapter(null);
    setIsCameraOpen(false);
  };

  // ==========================================
  // FIELD / CLASS CRUD OPERATIONS (Phase 4)
  // ==========================================

  const handleAddCustomField = (
    name: string,
    description: string,
    iconName: FieldIconName,
    colorTheme: ColorTheme
  ) => {
    if (!currentUser) return;

    const newFieldId = `field_custom_${Date.now()}_${currentUser.id.slice(0, 6)}`;
    const newField: AcademicField = {
      id: newFieldId,
      userId: currentUser.id,
      name,
      description,
      iconName,
      colorTheme,
      isCustom: true,
      orderIndex: fields.length,
      createdAt: Date.now(),
    };

    setFields([...fields, newField]);
    handleSelectField(newFieldId);
  };

  const handleSaveFieldEdit = (
    fieldId: string,
    name: string,
    description: string,
    iconName: FieldIconName,
    colorTheme: ColorTheme
  ) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, name, description, iconName, colorTheme }
          : f
      )
    );
  };

  const handleConfirmDeleteField = (fieldId: string) => {
    const remainingFields = fields.filter((f) => f.id !== fieldId);
    setFields(remainingFields);

    // Remove associated subjects & chapters
    const deletedSubjectIds = subjects.filter((s) => s.fieldId === fieldId).map((s) => s.id);
    setSubjects((prev) => prev.filter((s) => s.fieldId !== fieldId));
    setChapters((prev) => prev.filter((c) => !deletedSubjectIds.includes(c.subjectId)));

    if (currentUser?.selectedFieldId === fieldId) {
      const nextFieldId = remainingFields[0]?.id || 'field_pre_eng';
      handleSelectField(nextFieldId);
    }
  };

  const handleMoveFieldLeft = (field: AcademicField) => {
    const index = fields.findIndex((f) => f.id === field.id);
    if (index <= 0) return;
    const newFields = [...fields];
    const temp = newFields[index - 1];
    newFields[index - 1] = newFields[index];
    newFields[index] = temp;
    setFields(newFields);
  };

  const handleMoveFieldRight = (field: AcademicField) => {
    const index = fields.findIndex((f) => f.id === field.id);
    if (index < 0 || index >= fields.length - 1) return;
    const newFields = [...fields];
    const temp = newFields[index + 1];
    newFields[index + 1] = newFields[index];
    newFields[index] = temp;
    setFields(newFields);
  };

  // ==========================================
  // SUBJECT CRUD OPERATIONS (Phase 4)
  // ==========================================

  const handleAddSubject = (
    name: string,
    iconName: SubjectIconName,
    colorTheme: ColorTheme
  ) => {
    if (!currentUser) return;

    const currentFieldId = currentUser.selectedFieldId || fields[0]?.id || 'field_pre_eng';
    const fieldSubjects = subjects.filter((s) => s.fieldId === currentFieldId);

    const newSubject: Subject = {
      id: `sub_${Date.now()}_${currentUser.id.slice(0, 6)}`,
      userId: currentUser.id,
      fieldId: currentFieldId,
      name,
      iconName,
      colorTheme,
      chapterCount: 0,
      photoCount: 0,
      orderIndex: fieldSubjects.length,
      isCustom: true,
      createdAt: Date.now(),
    };

    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleSaveSubjectEdit = (
    subjectId: string,
    name: string,
    iconName: SubjectIconName,
    colorTheme: ColorTheme
  ) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId ? { ...s, name, iconName, colorTheme } : s
      )
    );

    if (activeSubject && activeSubject.id === subjectId) {
      setActiveSubject((prev) =>
        prev ? { ...prev, name, iconName, colorTheme } : null
      );
    }
  };

  const handleConfirmDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setChapters((prev) => prev.filter((c) => c.subjectId !== subjectId));

    if (activeSubject && activeSubject.id === subjectId) {
      setActiveSubject(null);
      setActiveChapter(null);
      setViewMode('dashboard');
    }
  };

  const handleMoveSubjectUp = (subject: Subject) => {
    const fieldSubjects = subjects.filter((s) => s.fieldId === subject.fieldId);
    const indexInField = fieldSubjects.findIndex((s) => s.id === subject.id);
    if (indexInField <= 0) return;

    const prevSubject = fieldSubjects[indexInField - 1];
    setSubjects((prev) => {
      const idxA = prev.findIndex((s) => s.id === subject.id);
      const idxB = prev.findIndex((s) => s.id === prevSubject.id);
      if (idxA === -1 || idxB === -1) return prev;
      const copy = [...prev];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });
  };

  const handleMoveSubjectDown = (subject: Subject) => {
    const fieldSubjects = subjects.filter((s) => s.fieldId === subject.fieldId);
    const indexInField = fieldSubjects.findIndex((s) => s.id === subject.id);
    if (indexInField < 0 || indexInField >= fieldSubjects.length - 1) return;

    const nextSubject = fieldSubjects[indexInField + 1];
    setSubjects((prev) => {
      const idxA = prev.findIndex((s) => s.id === subject.id);
      const idxB = prev.findIndex((s) => s.id === nextSubject.id);
      if (idxA === -1 || idxB === -1) return prev;
      const copy = [...prev];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });
  };

  const handleSelectSubject = (subject: Subject) => {
    setActiveSubject(subject);
    setActiveChapter(null);
    setViewMode('subject');
  };

  // ==========================================
  // CHAPTER CRUD OPERATIONS (Phase 5)
  // ==========================================

  const handleAddChapter = (title: string, chapterNumber: number) => {
    if (!currentUser || !activeSubject) return;

    const currentSubjectChapters = chapters.filter((c) => c.subjectId === activeSubject.id);
    const newChapterId = `chap_${Date.now()}_${currentUser.id.slice(0, 6)}`;

    const newChapter: Chapter = {
      id: newChapterId,
      userId: currentUser.id,
      subjectId: activeSubject.id,
      chapterNumber: chapterNumber || currentSubjectChapters.length + 1,
      orderIndex: currentSubjectChapters.length,
      title,
      isCompleted: false,
      photoCount: 0,
      pdfGenerated: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
    };

    const updatedChapters = [...chapters, newChapter];
    setChapters(updatedChapters);

    // Update subject chapter count
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === activeSubject.id
          ? { ...s, chapterCount: currentSubjectChapters.length + 1 }
          : s
      )
    );
  };

  const handleSaveChapterEdit = (
    chapterId: string,
    title: string,
    chapterNumber: number
  ) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, title, chapterNumber, updatedAt: Date.now() }
          : c
      )
    );

    if (activeChapter && activeChapter.id === chapterId) {
      setActiveChapter((prev) =>
        prev ? { ...prev, title, chapterNumber, updatedAt: Date.now() } : null
      );
    }
  };

  const handleConfirmDeleteChapter = async (chapterId: string) => {
    if (!currentUser) return;
    const targetChapter = chapters.find((c) => c.id === chapterId);
    if (!targetChapter) return;

    // 1. Move Chapter to Trash
    StorageService.moveChapterToTrash(currentUser.id, chapterId);

    // 2. Cascade soft delete of chapter photos
    const photos = await PhotoStorageService.getPhotosByChapter(currentUser.id, chapterId);
    for (const p of photos) {
      await PhotoStorageService.moveToTrash(currentUser.id, p.id);
    }

    // 3. Update active chapters state
    const remainingChapters = StorageService.getChapters(currentUser.id).filter((c) => !c.isDeleted);
    setChapters(remainingChapters);

    // Update subject chapter count
    if (activeSubject) {
      const subjectRemaining = remainingChapters.filter((c) => c.subjectId === activeSubject.id);
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === activeSubject.id
            ? { ...s, chapterCount: subjectRemaining.length }
            : s
        )
      );
    }

    if (activeChapter && activeChapter.id === chapterId) {
      setActiveChapter(null);
      setViewMode('subject');
    }
  };

  const handleToggleChapterCompletion = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, isCompleted: !c.isCompleted, updatedAt: Date.now() }
          : c
      )
    );

    if (activeChapter && activeChapter.id === chapterId) {
      setActiveChapter((prev) =>
        prev ? { ...prev, isCompleted: !prev.isCompleted, updatedAt: Date.now() } : null
      );
    }
  };

  const handleMoveChapterUp = (chapter: Chapter) => {
    const subjectChapters = chapters.filter((c) => c.subjectId === chapter.subjectId);
    const indexInSubject = subjectChapters.findIndex((c) => c.id === chapter.id);
    if (indexInSubject <= 0) return;

    const prevChapter = subjectChapters[indexInSubject - 1];
    setChapters((prev) => {
      const idxA = prev.findIndex((c) => c.id === chapter.id);
      const idxB = prev.findIndex((c) => c.id === prevChapter.id);
      if (idxA === -1 || idxB === -1) return prev;
      const copy = [...prev];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });
  };

  const handleMoveChapterDown = (chapter: Chapter) => {
    const subjectChapters = chapters.filter((c) => c.subjectId === chapter.subjectId);
    const indexInSubject = subjectChapters.findIndex((c) => c.id === chapter.id);
    if (indexInSubject < 0 || indexInSubject >= subjectChapters.length - 1) return;

    const nextChapter = subjectChapters[indexInSubject + 1];
    setChapters((prev) => {
      const idxA = prev.findIndex((c) => c.id === chapter.id);
      const idxB = prev.findIndex((c) => c.id === nextChapter.id);
      if (idxA === -1 || idxB === -1) return prev;
      const copy = [...prev];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setViewMode('chapter');

    // Record chapter open in recent search history
    if (currentUser && activeSubject) {
      SearchService.recordChapterOpened(currentUser.id, chapter, activeSubject, currentField);
    }
  };

  // ==========================================
  // GLOBAL SEARCH NAVIGATION HANDLERS (Phase 12)
  // ==========================================

  const handleNavigateToFieldFromSearch = (fieldId: string) => {
    handleSelectField(fieldId);
    setActiveTab('study');
    setViewMode('dashboard');
  };

  const handleNavigateToSubjectFromSearch = (fieldId: string, subjectId: string) => {
    handleSelectField(fieldId);
    const targetSubject = subjects.find((s) => s.id === subjectId);
    if (targetSubject) {
      setActiveSubject(targetSubject);
      setActiveChapter(null);
      setViewMode('subject');
      setActiveTab('study');
    }
  };

  const handleNavigateToChapterFromSearch = (
    fieldId: string,
    subjectId: string,
    chapterId: string
  ) => {
    handleSelectField(fieldId);
    let targetSubject = subjects.find((s) => s.id === subjectId);
    const targetChapter = chapters.find((c) => c.id === chapterId);

    if (!targetSubject && targetChapter) {
      targetSubject = subjects.find((s) => s.id === targetChapter.subjectId);
    }

    if (targetSubject) {
      setActiveSubject(targetSubject);
    }

    if (targetChapter) {
      setActiveChapter(targetChapter);
      setViewMode('chapter');
      setActiveTab('study');

      if (currentUser && targetSubject) {
        SearchService.recordChapterOpened(currentUser.id, targetChapter, targetSubject, currentField);
      }
    }
  };

  // ==========================================
  // PHOTO & BOARD CAMERA OPERATIONS (Phase 6 & 7)
  // ==========================================

  const handlePhotoCaptured = (photo: BoardPhoto) => {
    // 1. Add to active chapter photo state
    setChapterPhotos((prev) => [...prev, photo]);

    // 2. Increment active chapter photoCount
    if (activeChapter) {
      const newCount = (activeChapter.photoCount || 0) + 1;
      setActiveChapter((prev) => (prev ? { ...prev, photoCount: newCount } : null));

      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChapter.id ? { ...c, photoCount: newCount, updatedAt: Date.now() } : c
        )
      );
    }

    // 3. Increment active subject photoCount
    if (activeSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === activeSubject.id ? { ...s, photoCount: (s.photoCount || 0) + 1 } : s
        )
      );
    }
  };

  const handleImportPhotos = async (importedPhotos: BoardPhoto[]) => {
    if (importedPhotos.length === 0) return;

    // 1. Save all imported photos to IndexedDB
    await PhotoStorageService.savePhotos(importedPhotos);

    // 2. Update active chapter photos state
    const updatedList = [...chapterPhotos, ...importedPhotos];
    setChapterPhotos(updatedList);

    // 3. Update active chapter photoCount
    if (activeChapter) {
      const newCount = updatedList.length;
      setActiveChapter((prev) => (prev ? { ...prev, photoCount: newCount, updatedAt: Date.now() } : null));

      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChapter.id ? { ...c, photoCount: newCount, updatedAt: Date.now() } : c
        )
      );
    }

    // 4. Update active subject photoCount
    if (activeSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === activeSubject.id
            ? { ...s, photoCount: (s.photoCount || 0) + importedPhotos.length }
            : s
        )
      );
    }
  };

  const handleReorderPhotos = async (reorderedPhotos: BoardPhoto[]) => {
    if (reorderedPhotos.length === 0 || !currentUser || !activeChapter) return;

    // 1. Save updated order to IndexedDB
    await PhotoStorageService.savePhotos(reorderedPhotos);

    // 2. Update local state
    setChapterPhotos(reorderedPhotos);
  };

  const handleSaveEditedPhoto = async (updatedPhoto: BoardPhoto) => {
    if (!updatedPhoto || !currentUser || !activeChapter) return;

    // 1. Save updated photo to IndexedDB (keeps same ID, userId, chapterId)
    await PhotoStorageService.savePhoto(updatedPhoto);

    // 2. Update local state
    setChapterPhotos((prev) =>
      prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p))
    );
  };

  const handleRestoreOriginalPhoto = async (restoredPhoto: BoardPhoto) => {
    if (!restoredPhoto || !currentUser || !activeChapter) return;

    // 1. Save restored photo to IndexedDB
    await PhotoStorageService.savePhoto(restoredPhoto);

    // 2. Update local state
    setChapterPhotos((prev) =>
      prev.map((p) => (p.id === restoredPhoto.id ? restoredPhoto : p))
    );
  };

  const handleDeletePhoto = async (photoId: string) => {
    await PhotoStorageService.deletePhoto(photoId);

    // Update local state list
    const updatedPhotos = chapterPhotos.filter((p) => p.id !== photoId);
    setChapterPhotos(updatedPhotos);

    // Decrement chapter photo count
    if (activeChapter) {
      const newCount = Math.max(0, updatedPhotos.length);
      setActiveChapter((prev) => (prev ? { ...prev, photoCount: newCount, updatedAt: Date.now() } : null));

      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChapter.id ? { ...c, photoCount: newCount, updatedAt: Date.now() } : c
        )
      );
    }

    // Decrement subject photo count
    if (activeSubject) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === activeSubject.id ? { ...s, photoCount: Math.max(0, (s.photoCount || 1) - 1) } : s
        )
      );
    }
  };

  // If user is not authenticated, show the Login Screen
  if (!currentUser) {
    return <LoginScreen onSignInWithGoogle={handleGoogleSignIn} />;
  }

  // First-Time Student Profile Setup Flow
  const isProfileSetupComplete = Boolean(
    currentUser.isProfileSetupComplete ||
      (currentUser.hasSelectedInitialField &&
        currentUser.selectedFieldId &&
        currentUser.fatherName)
  );

  if (!isProfileSetupComplete) {
    return (
      <ProfileSetupScreen
        user={currentUser}
        fields={fields}
        onBack={handleSignOut}
        onCompleteSetup={handleCompleteProfileSetup}
      />
    );
  }

  const currentField =
    fields.find((f) => f.id === currentUser.selectedFieldId) ||
    fields[0] || {
      id: 'field_pre_eng',
      name: 'Pre-Engineering',
      description: 'Mathematics, Physics, Chemistry',
    };

  const existingFieldNames = fields.map((f) => f.name);
  const currentFieldSubjects = subjects.filter((s) => s.fieldId === currentField.id);
  const existingSubjectNames = currentFieldSubjects.map((s) => s.name);

  // Active Subject Chapters
  const activeSubjectChapters = activeSubject
    ? chapters.filter((c) => c.subjectId === activeSubject.id)
    : [];
  const existingChapterTitles = activeSubjectChapters.map((c) => c.title);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-20">
      {/* Sticky Top Header */}
      <Header
        isDarkMode={settings.isDarkMode}
        onToggleTheme={toggleTheme}
        selectedFieldName={currentField.name}
        user={currentUser}
        syncProgress={syncProgress}
        onOpenSyncDetail={() => setIsSyncModalOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenSearch={() => setActiveTab('search')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'study' && (
          <div key={`study-${viewMode}-${activeSubject?.id || 'root'}-${activeChapter?.id || 'root'}`} className="animate-page-enter">
            {/* View 1: Academic Field & Subject Dashboard (Phase 13 Complete Home Experience) */}
            {viewMode === 'dashboard' && (
              <DashboardView
                user={currentUser}
                fields={fields}
                selectedFieldId={currentUser.selectedFieldId}
                onSelectField={handleSelectField}
                onAddCustomField={() => setIsAddCustomFieldOpen(true)}
                onEditField={(field) => setFieldToEdit(field)}
                onDeleteField={(field) => setFieldToDelete(field)}
                onMoveFieldLeft={handleMoveFieldLeft}
                onMoveFieldRight={handleMoveFieldRight}
                subjects={subjects}
                chapters={chapters}
                onSelectSubject={handleSelectSubject}
                onAddSubject={() => setIsAddSubjectOpen(true)}
                onEditSubject={(subject) => setSubjectToEdit(subject)}
                onDeleteSubject={(subject) => setSubjectToDelete(subject)}
                onMoveSubjectUp={handleMoveSubjectUp}
                onMoveSubjectDown={handleMoveSubjectDown}
                onSelectChapter={(targetChapter, targetSubject) => {
                  setActiveSubject(targetSubject);
                  setActiveChapter(targetChapter);
                  setViewMode('chapter');
                  if (currentUser) {
                    SearchService.recordChapterOpened(
                      currentUser.id,
                      targetChapter,
                      targetSubject,
                      currentField
                    );
                  }
                }}
                onQuickCapture={(action) => setQuickCaptureAction(action)}
                onOpenGlobalSearch={() => setActiveTab('search')}
                onNavigateToPdfs={() => setActiveTab('pdfs')}
                onNavigateToTeacher={handleNavigateToTeacher}
                syncProgress={syncProgress}
              />
            )}

            {/* View 2: Subject Chapter List Screen (Phase 5) */}
            {viewMode === 'subject' && activeSubject && (
              <SubjectDetailView
                subject={activeSubject}
                field={currentField}
                chapters={activeSubjectChapters}
                onBack={() => {
                  setViewMode('dashboard');
                  setActiveSubject(null);
                }}
                onEditSubject={(subj) => setSubjectToEdit(subj)}
                onDeleteSubject={(subj) => setSubjectToDelete(subj)}
                onSelectChapter={handleSelectChapter}
                onAddChapter={() => setIsAddChapterOpen(true)}
                onEditChapter={(chap) => setChapterToEdit(chap)}
                onDeleteChapter={(chap) => setChapterToDelete(chap)}
                onToggleChapterComplete={handleToggleChapterCompletion}
                onMoveChapterUp={handleMoveChapterUp}
                onMoveChapterDown={handleMoveChapterDown}
              />
            )}

            {/* View 3: Chapter Detail Screen (Phase 7 Workspace with Camera & Gallery Import) */}
            {viewMode === 'chapter' && activeChapter && activeSubject && (
              <ChapterDetailView
                user={currentUser}
                chapter={activeChapter}
                subject={activeSubject}
                field={currentField}
                photos={chapterPhotos}
                onBack={() => {
                  setViewMode('subject');
                  setActiveChapter(null);
                }}
                onToggleComplete={handleToggleChapterCompletion}
                onEditChapter={(chap) => setChapterToEdit(chap)}
                onDeleteChapter={(chap) => setChapterToDelete(chap)}
                onOpenBoardCamera={() => setIsCameraOpen(true)}
                onDeletePhoto={handleDeletePhoto}
                onImportPhotos={handleImportPhotos}
                onReorderPhotos={handleReorderPhotos}
                onSaveEditedPhoto={handleSaveEditedPhoto}
                onRestoreOriginalPhoto={handleRestoreOriginalPhoto}
              />
            )}
          </div>
        )}

        {/* Global Search Tab (Phase 12) */}
        {activeTab === 'search' && (
          <div key="search-tab" className="animate-page-enter">
            <SearchView
              user={currentUser}
              fields={fields}
              onNavigateToField={handleNavigateToFieldFromSearch}
              onNavigateToSubject={handleNavigateToSubjectFromSearch}
              onNavigateToChapter={handleNavigateToChapterFromSearch}
              onNavigateToPdf={(pdf) => {
                setActiveTab('pdfs');
              }}
              onNavigateToAllPdfs={() => setActiveTab('pdfs')}
            />
          </div>
        )}

        {/* AI Academic Teacher Tab */}
        {activeTab === 'teacher' && (
          <div key="teacher-tab" className="animate-page-enter">
            <AITeacherView
              currentUser={currentUser}
              fields={fields}
              subjects={subjects}
              chapters={chapters}
              initialContext={
                teacherContext ||
                (currentField
                  ? {
                      fieldId: currentField.id,
                      fieldName: currentField.name,
                      subjectId: activeSubject?.id,
                      subjectName: activeSubject?.name,
                      chapterId: activeChapter?.id,
                      chapterTitle: activeChapter?.title,
                      chapterNumber: activeChapter?.chapterNumber,
                    }
                  : undefined)
              }
            />
          </div>
        )}

        {/* PDF Library Tab (Phase 10) */}
        {activeTab === 'pdfs' && (
          <div key="pdfs-tab" className="animate-page-enter">
            <PdfLibraryView
              user={currentUser}
              onNavigateToChapter={(targetFieldId, targetSubjectId, targetChapterId) => {
                const targetSubject = subjects.find((s) => s.id === targetSubjectId);
                const targetChapter = chapters.find((c) => c.id === targetChapterId);
                if (targetSubject && targetChapter) {
                  setActiveSubject(targetSubject);
                  setActiveChapter(targetChapter);
                  setViewMode('chapter');
                  setActiveTab('study');
                }
              }}
            />
          </div>
        )}

        {/* Trash & Recovery Tab */}
        {activeTab === 'trash' && (
          <div key="trash-tab" className="animate-page-enter">
            <TrashView
              user={currentUser}
              onNavigateToChapter={(chapterId) => {
                // Implementation to navigate to a chapter if needed
              }}
              onNavigateToPdfs={() => setActiveTab('pdfs')}
            />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div key="profile-tab" className="animate-page-enter">
            <ProfileScreen
              user={currentUser}
              fields={fields}
              subjects={subjects}
              settings={settings}
              syncProgress={syncProgress}
              onUpdateField={handleSelectField}
              onUpdateSettings={handleUpdateSettings}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
              onRefreshData={reloadAllData}
              onOpenTrash={() => setActiveTab('trash')}
              onNavigateToStudy={() => {
                setActiveTab('study');
                setViewMode('dashboard');
              }}
            />
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (activeTab === 'trash' && tab !== 'trash') {
            reloadAllData(); // Refresh data to reflect restored items
          }
          setActiveTab(tab);
          if (tab === 'study' && viewMode !== 'dashboard') {
            setViewMode('dashboard');
            setActiveSubject(null);
            setActiveChapter(null);
          }
        }}
      />

      {/* ========================================== */}
      {/* CLOUD SYNCHRONIZATION DETAIL MODAL (Phase 9) */}
      {/* ========================================== */}
      <SyncDetailModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={currentUser}
        progress={syncProgress}
        settings={settings}
        onRefreshData={reloadAllData}
      />

      {/* ========================================== */}
      {/* FULLSCREEN BOARD CAMERA VIEW (Phase 6)     */}
      {/* ========================================== */}
      {isCameraOpen && activeChapter && activeSubject && (
        <BoardCameraView
          user={currentUser}
          chapter={activeChapter}
          subject={activeSubject}
          field={currentField}
          onClose={() => {
            setIsCameraOpen(false);
            loadChapterPhotos();
          }}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {/* ========================================== */}
      {/* FIELD / CLASS MANAGEMENT MODALS (Phase 4)  */}
      {/* ========================================== */}

      <AddCustomFieldModal
        isOpen={isAddCustomFieldOpen}
        onClose={() => setIsAddCustomFieldOpen(false)}
        onAdd={handleAddCustomField}
        existingFieldNames={existingFieldNames}
      />

      <EditFieldModal
        isOpen={!!fieldToEdit}
        onClose={() => setFieldToEdit(null)}
        field={fieldToEdit}
        onSave={handleSaveFieldEdit}
        existingFieldNames={existingFieldNames}
      />

      <DeleteFieldConfirmModal
        isOpen={!!fieldToDelete}
        onClose={() => setFieldToDelete(null)}
        field={fieldToDelete}
        subjectCount={
          fieldToDelete
            ? subjects.filter((s) => s.fieldId === fieldToDelete.id).length
            : 0
        }
        onConfirm={handleConfirmDeleteField}
      />

      {/* ========================================== */}
      {/* SUBJECT MANAGEMENT MODALS (Phase 4)       */}
      {/* ========================================== */}

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAdd={handleAddSubject}
        fieldName={currentField.name}
        existingSubjectNames={existingSubjectNames}
      />

      <EditSubjectModal
        isOpen={!!subjectToEdit}
        onClose={() => setSubjectToEdit(null)}
        subject={subjectToEdit}
        onSave={handleSaveSubjectEdit}
        existingSubjectNames={existingSubjectNames}
      />

      <DeleteSubjectConfirmModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        subject={subjectToDelete}
        onConfirm={handleConfirmDeleteSubject}
      />

      {/* ========================================== */}
      {/* CHAPTER MANAGEMENT MODALS (Phase 5)       */}
      {/* ========================================== */}

      <AddChapterModal
        isOpen={isAddChapterOpen}
        onClose={() => setIsAddChapterOpen(false)}
        onAdd={handleAddChapter}
        nextChapterNumber={activeSubjectChapters.length + 1}
        subjectName={activeSubject?.name || 'Subject'}
        existingChapterTitles={existingChapterTitles}
      />

      <EditChapterModal
        isOpen={!!chapterToEdit}
        onClose={() => setChapterToEdit(null)}
        chapter={chapterToEdit}
        onSave={handleSaveChapterEdit}
        existingChapterTitles={existingChapterTitles}
      />

      <DeleteChapterModal
        isOpen={!!chapterToDelete}
        onClose={() => setChapterToDelete(null)}
        chapter={chapterToDelete}
        onConfirm={handleConfirmDeleteChapter}
      />

      {/* ========================================== */}
      {/* QUICK CAPTURE DESTINATION MODAL (Phase 13) */}
      {/* ========================================== */}
      {quickCaptureAction && (
        <QuickCaptureDestinationModal
          isOpen={!!quickCaptureAction}
          onClose={() => setQuickCaptureAction(null)}
          subjects={currentFieldSubjects}
          chapters={chapters}
          targetAction={quickCaptureAction}
          onProceed={(targetSubject, targetChapter, action) => {
            setActiveSubject(targetSubject);
            setActiveChapter(targetChapter);
            setViewMode('chapter');
            setActiveTab('study');

            if (currentUser) {
              SearchService.recordChapterOpened(
                currentUser.id,
                targetChapter,
                targetSubject,
                currentField
              );
            }

            if (action === 'camera') {
              setIsCameraOpen(true);
            }
          }}
          onAddNewChapter={(targetSubject) => {
            setActiveSubject(targetSubject);
            setIsAddChapterOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <>
      <MainApp />
    </>
  );
}
