import React, { useState, useEffect, useMemo } from 'react';
import {
  AcademicField,
  Subject,
  Chapter,
  UserProfile,
  BoardPhoto,
  StudyPDF,
  SyncProgress,
  RecentOpenedChapter,
  AITeacherStudyMode,
} from '../../types';
import { SubjectCard } from './SubjectCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { SearchService } from '../../services/searchService';
import { PhotoStorageService } from '../../services/photoStorage';
import { PDFStorageService } from '../../services/pdfStorage';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Atom,
  Dna,
  Code,
  Calculator,
  Briefcase,
  Palette,
  Compass,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Search,
  Camera,
  Image as ImageIcon,
  FileText,
  Clock,
  ChevronRight,
  WifiOff,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile | null;
  fields: AcademicField[];
  selectedFieldId: string;
  onSelectField: (fieldId: string) => void;
  onAddCustomField: () => void;
  onEditField: (field: AcademicField) => void;
  onDeleteField: (field: AcademicField) => void;
  onMoveFieldLeft: (field: AcademicField) => void;
  onMoveFieldRight: (field: AcademicField) => void;
  subjects: Subject[];
  chapters: Chapter[];
  onSelectSubject: (subject: Subject) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
  onMoveSubjectUp: (subject: Subject) => void;
  onMoveSubjectDown: (subject: Subject) => void;
  onSelectChapter: (chapter: Chapter, subject: Subject) => void;
  onQuickCapture: (action: 'camera' | 'import') => void;
  onOpenGlobalSearch: () => void;
  onNavigateToPdfs: () => void;
  onNavigateToTeacher?: (mode?: AITeacherStudyMode) => void;
  syncProgress?: SyncProgress;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  fields,
  selectedFieldId,
  onSelectField,
  onAddCustomField,
  onEditField,
  onDeleteField,
  onMoveFieldLeft,
  onMoveFieldRight,
  subjects,
  chapters,
  onSelectSubject,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onMoveSubjectUp,
  onMoveSubjectDown,
  onSelectChapter,
  onQuickCapture,
  onOpenGlobalSearch,
  onNavigateToPdfs,
  onNavigateToTeacher,
  syncProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChapters, setRecentChapters] = useState<RecentOpenedChapter[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<BoardPhoto[]>([]);
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set());
  const [pdfCount, setPdfCount] = useState<number>(0);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<BoardPhoto | null>(null);

  // Load Real Recents and PDF stats on mount or when user changes
  useEffect(() => {
    if (!user) return;

    // 1. Load recently opened chapters
    const recents = SearchService.getRecentlyOpenedChapters(user.id, 4);
    setRecentChapters(recents);

    // 2. Load recently captured photos across all chapters
    PhotoStorageService.getAllActivePhotos(user.id)
      .then((photos) => {
        const sorted = [...photos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRecentPhotos(sorted.slice(0, 6));
      })
      .catch((e) => console.warn('Could not load recent photos for home dashboard', e));

    // 3. Load PDF count
    PDFStorageService.getPDFsByUser(user.id)
      .then((pdfs) => {
        setPdfCount(pdfs.length);
      })
      .catch((e) => console.warn('Could not load PDF counts for home dashboard', e));
  }, [user, chapters]);

  // Current active field
  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  // Subjects belonging to current field
  const fieldSubjects = useMemo(() => {
    return subjects.filter((s) => s.fieldId === selectedFieldId);
  }, [subjects, selectedFieldId]);

  // Filtered subjects based on local search bar
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return fieldSubjects;
    const q = searchQuery.toLowerCase().trim();
    return fieldSubjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [fieldSubjects, searchQuery]);

  // Precompute real chapter counts per subject
  const subjectStats = useMemo(() => {
    const stats: Record<string, { chapterCount: number; photoCount: number; completedCount: number }> = {};
    subjects.forEach((sub) => {
      const subChapters = chapters.filter((c) => c.subjectId === sub.id && !c.isDeleted);
      const chapterCount = subChapters.length;
      const completedCount = subChapters.filter((c) => c.isCompleted).length;
      const photoCount = subChapters.reduce((acc, c) => acc + (c.photoCount || 0), 0);
      stats[sub.id] = { chapterCount, photoCount, completedCount };
    });
    return stats;
  }, [subjects, chapters]);

  // Only display the student's selected field track in the Field / Class Track bar
  const displayedFields = useMemo(() => {
    const matched = fields.filter((f) => f.id === selectedFieldId);
    if (matched.length > 0) return matched;
    return fields.length > 0 ? [fields[0]] : [];
  }, [fields, selectedFieldId]);

  const currentFieldIndex = fields.findIndex((f) => f.id === selectedFieldId);
  const canMoveFieldLeft = currentFieldIndex > 0;
  const canMoveFieldRight = currentFieldIndex < fields.length - 1;

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFieldIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-4 h-4" />;
      case 'Dna':
        return <Dna className="w-4 h-4" />;
      case 'Code':
        return <Code className="w-4 h-4" />;
      case 'Calculator':
        return <Calculator className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'GraduationCap':
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  // Handler to open recent chapter
  const handleOpenRecentChapter = (item: RecentOpenedChapter) => {
    const targetSubject = subjects.find((s) => s.id === item.subjectId);
    let targetChapter = chapters.find((c) => c.id === item.chapterId);
    if (!targetChapter) {
      targetChapter = {
        id: item.chapterId,
        userId: user?.id || '',
        subjectId: item.subjectId,
        title: item.chapterTitle,
        chapterNumber: item.chapterNumber,
        photoCount: 0,
        isCompleted: false,
        pdfGenerated: false,
        isDeleted: false,
        orderIndex: 0,
        createdAt: item.openedAt,
        updatedAt: item.openedAt,
        syncStatus: 'synced',
      };
    }
    if (targetSubject && targetChapter) {
      if (item.fieldId && item.fieldId !== selectedFieldId) {
        onSelectField(item.fieldId);
      }
      onSelectChapter(targetChapter, targetSubject);
    }
  };

  // Check if first-time user needs to choose their field
  const showFirstTimeFieldSelection =
    user?.hasSelectedInitialField === false || (!user?.selectedFieldId && !selectedFieldId);

  if (showFirstTimeFieldSelection) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Onboarding Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Welcome to Easy Study Snap</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose your academic field to personalize your subjects, chapter outlines, and classroom board captures.
          </p>
        </div>

        {/* Available Fields Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Your Academic Track
            </h2>
            <span className="text-xs text-slate-400">Step 1 of 1</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const matchingSubjects = subjects.filter((s) => s.fieldId === field.id);
              const subjectSummary =
                matchingSubjects.length > 0
                  ? matchingSubjects.map((s) => s.name).join(' · ')
                  : field.id === 'field_pre_eng'
                  ? 'Mathematics · Physics · Chemistry'
                  : field.id === 'field_med' || field.id === 'field_pre_med'
                  ? 'Biology · Physics · Chemistry'
                  : field.id === 'field_cs'
                  ? 'Programming · Discrete Math · Physics'
                  : field.id === 'field_arts'
                  ? 'World History · Literature · Philosophy'
                  : 'Custom Curriculum';

              return (
                <div
                  key={field.id}
                  id={`onboarding-field-${field.id}`}
                  onClick={() => onSelectField(field.id)}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/70 dark:hover:border-indigo-400/70 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer active:scale-[0.98]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                        {getFieldIcon(field.iconName)}
                      </div>
                      {field.isCustom ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Track
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {field.name}
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                        {subjectSummary}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Select this track</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </div>
              );
            })}

            {/* Create Custom Field Card */}
            <div
              id="onboarding-create-custom-field-card"
              onClick={onAddCustomField}
              className="group flex flex-col justify-between p-5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 ease-out cursor-pointer active:scale-[0.98]"
            >
              <div className="space-y-3">
                <div className="p-2.5 w-fit rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Create Custom Field
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    Design Your Curriculum
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Add a unique academic track with your own custom subjects and chapters.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Add custom track</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 You can switch fields or customize subjects anytime from the dashboard or settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-7">
      {/* 1. Academic Field Hero Banner (Matching Reference Layout) */}
      <div 
        id="home-hero-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-7 shadow-xl shadow-indigo-600/20 border border-white/20"
      >
        {/* Background glow effects & decorative elements */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left Text & Actions Section */}
          <div className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-100/90 text-xs sm:text-sm font-medium tracking-wide">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
                </span>
                {syncProgress?.isOnline === false && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900/70 text-amber-300 border border-amber-400/30">
                    <WifiOff className="w-2.5 h-2.5" /> Offline
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{currentField?.name || 'Pre-Engineering'}</span>
                {currentField?.isCustom && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/30">
                    Custom
                  </span>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
                {fieldSubjects.length > 0
                  ? fieldSubjects.map((s) => s.name).join(' • ')
                  : currentField?.description || 'Mathematics • Physics • Chemistry'}
              </p>
            </div>

            {/* Horizontal Action Buttons Row (Capture Board, Import Photos, AI Academic Teacher) */}
            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              {/* Primary Action: Capture Board */}
              <button
                id="home-quick-capture-btn"
                type="button"
                onClick={() => onQuickCapture('camera')}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-indigo-900 bg-white hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-md shadow-indigo-950/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out cursor-pointer select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Camera className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="whitespace-nowrap">Capture Board</span>
              </button>

              {/* Secondary Action: Import Photos */}
              <button
                id="home-quick-import-btn"
                type="button"
                onClick={() => onQuickCapture('import')}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-xl border border-white/25 hover:border-white/40 shadow-xs hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-md transition-all duration-200 ease-out cursor-pointer select-none touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <ImageIcon className="w-4 h-4 text-blue-200 shrink-0" />
                <span className="whitespace-nowrap">Import Photos</span>
              </button>

              {/* AI Academic Teacher Integrated Action */}
              {onNavigateToTeacher && (
                <button
                  id="home-quick-teacher-btn"
                  type="button"
                  onClick={() => onNavigateToTeacher('learn_concept')}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-4.5 py-2.5 text-xs sm:text-sm font-bold text-amber-200 bg-gradient-to-r from-indigo-950/70 to-purple-950/70 hover:from-indigo-950/90 hover:to-purple-950/90 active:scale-[0.98] rounded-xl border border-amber-300/40 hover:border-amber-300/70 shadow-xs hover:-translate-y-0.5 backdrop-blur-md transition-all duration-200 ease-out cursor-pointer select-none touch-manipulation group"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300 shrink-0 group-hover:rotate-6 transition-transform" />
                  <span className="whitespace-nowrap text-white">AI Teacher</span>
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0 animate-pulse" />
                </button>
              )}
            </div>
          </div>

          {/* Right Academic 3D Illustration matching reference mockup */}
          <div className="hidden sm:flex items-center justify-center shrink-0 relative pr-2">
            <div className="relative w-36 h-32 flex items-center justify-center">
              {/* Stacked Academic Books Graphic */}
              <div className="relative">
                {/* Book 1 (Bottom - Blue) */}
                <div className="w-28 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-sm shadow-md transform -rotate-3 translate-y-6 border-b-2 border-blue-600">
                  <div className="w-4 h-full bg-white/20 ml-2" />
                </div>
                {/* Book 2 (Middle - Orange) */}
                <div className="w-26 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-sm shadow-md transform rotate-2 translate-y-2 border-b-2 border-orange-600 ml-1">
                  <div className="w-4 h-full bg-white/20 ml-2" />
                </div>
                {/* Book 3 (Top - Turquoise) */}
                <div className="w-24 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-sm shadow-md transform -rotate-1 -translate-y-2 border-b-2 border-teal-600 ml-2">
                  <div className="w-3 h-full bg-white/20 ml-2" />
                </div>

                {/* Graduation Cap atop the books */}
                <div className="absolute -top-7 left-3 z-10 drop-shadow-lg">
                  <div className="w-16 h-8 bg-gradient-to-r from-slate-900 to-indigo-950 transform rotate-12 skew-x-12 rounded-xs border-t border-slate-700 relative">
                    {/* Cap Button */}
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-xs" />
                    {/* Tassel */}
                    <div className="w-6 h-0.5 bg-amber-400 absolute top-1/2 left-1/2 origin-left rotate-45">
                      <div className="w-1.5 h-3 bg-amber-400 absolute right-0 top-0 rounded-xs" />
                    </div>
                  </div>
                  {/* Cap Skull base */}
                  <div className="w-8 h-4 bg-slate-900 rounded-b-lg mx-auto -mt-1 shadow-sm" />
                </div>

                {/* Sparkle accents */}
                <Sparkles className="w-4 h-4 text-amber-300 absolute -top-4 -right-2 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-2 -left-2 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Field / Track Indicator (Displays only the student's selected academic track) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Field / Class Track
          </label>

          <Button
            id="btn-add-custom-field"
            variant="ghost"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={onAddCustomField}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#131d36]"
          >
            + Add Custom Field
          </Button>
        </div>

        {/* Selected Field Track Pill */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {displayedFields.map((field) => (
            <div
              key={field.id}
              id={`field-tab-${field.id}`}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white border border-indigo-400/40 shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-500/20 whitespace-nowrap"
            >
              <span className="text-white">
                {getFieldIcon(field.iconName)}
              </span>
              <span>{field.name}</span>
              {field.isCustom ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-900/80 text-indigo-100 border border-indigo-300/30">
                  Custom
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider bg-indigo-900/80 text-indigo-100 border border-indigo-300/30">
                  Active Track
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Subjects Screen Header & Subject Cards Grid */}
      <div id="subjects-section" className="space-y-4 pt-1">
        {/* Top Bar for Subjects */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">
              Subjects
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              {filteredSubjects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick search input */}
            <div className="relative w-36 xs:w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-subjects-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              id="add-subject-btn"
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={onAddSubject}
              className="text-xs font-semibold shadow-xs whitespace-nowrap"
            >
              + Add Subject
            </Button>
          </div>
        </div>

        {/* Subject Cards Grid with Real Chapter and Photo Counts */}
        {filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSubjects.map((subject, index) => {
              const canMoveUp = index > 0;
              const canMoveDown = index < filteredSubjects.length - 1;
              const stats = subjectStats[subject.id] || { chapterCount: 0, photoCount: 0, completedCount: 0 };

              return (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  chapterCount={stats.chapterCount}
                  photoCount={stats.photoCount}
                  completedChapterCount={stats.completedCount}
                  onClick={onSelectSubject}
                  onEdit={onEditSubject}
                  onDelete={onDeleteSubject}
                  onMoveUp={onMoveSubjectUp}
                  onMoveDown={onMoveSubjectDown}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 sm:p-10 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs border border-blue-100 dark:border-blue-900/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-xs mx-auto space-y-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {searchQuery ? 'No matching subjects found' : 'No subjects yet'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No subjects match "${searchQuery}". Clear your search or add it as a new subject.`
                  : 'Add a subject to start organizing your study material.'}
              </p>
            </div>
            <Button
              id="empty-state-add-subject-btn"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onAddSubject}
              className="mt-2 text-xs font-bold"
            >
              + Add Subject
            </Button>
          </div>
        )}
      </div>

      {/* 4. Quick Hub Cards: Recently Opened & My PDFs Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recently Opened Chapters (2 Columns on desktop) */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Recently Opened
            </h3>
            <span className="text-[11px] text-slate-400">Quick jump</span>
          </div>

          {recentChapters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentChapters.map((item) => (
                <button
                  key={`${item.chapterId}-${item.openedAt}`}
                  type="button"
                  onClick={() => handleOpenRecentChapter(item)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#131d36] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/70 shadow-xs hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left group cursor-pointer"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                        Ch. {item.chapterNumber}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                        {item.subjectName}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.chapterTitle}
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white dark:bg-[#131d36] border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No recent chapters yet
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Chapters you open will automatically appear here for 1-tap access.
              </p>
            </div>
          )}
        </div>

        {/* My PDFs Entry Card */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              My PDFs
            </h3>
          </div>

          <button
            type="button"
            onClick={onNavigateToPdfs}
            className="w-full h-[calc(100%-28px)] min-h-[96px] p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-[#131d36] dark:via-[#131d36] dark:to-[#1a2647] border border-indigo-100 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/70 shadow-xs hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Open Library <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {pdfCount} {pdfCount === 1 ? 'Study PDF' : 'Study PDFs'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ready for offline review & export
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. Recently Captured Snapshots Strip */}
      {recentPhotos.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Recently Captured Snapshots
            </h3>
            <span className="text-[11px] text-slate-400">Latest board captures</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {recentPhotos.map((photo, idx) => {
              const photoSrc =
                photo.thumbnailUrl || photo.localDataUrl || photo.originalDataUrl || photo.cloudUrl;
              const hasError = failedPhotoIds.has(photo.id) || !photoSrc;
              const parentChapter = chapters.find((c) => c.id === photo.chapterId);
              const parentSubject = parentChapter
                ? subjects.find((s) => s.id === parentChapter.subjectId)
                : undefined;

              return (
                <div
                  key={photo.id}
                  id={`recent-snapshot-${photo.id}`}
                  onClick={() => setSelectedPhotoPreview(photo)}
                  className="aspect-square rounded-xl overflow-hidden bg-[#0a0f1d] border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer shadow-xs hover:border-indigo-400/80 dark:hover:border-indigo-500/70 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                  title={
                    parentChapter && parentSubject
                      ? `${parentSubject.name} • Ch. ${parentChapter.chapterNumber}: Photo #${photo.orderIndex || idx + 1}`
                      : `Board Photo #${photo.orderIndex || idx + 1}`
                  }
                >
                  {!hasError ? (
                    <img
                      src={photoSrc}
                      alt={photo.fileName || `Recent board capture #${photo.orderIndex || idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                      onError={() => {
                        setFailedPhotoIds((prev) => new Set(prev).add(photo.id));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 bg-slate-100 dark:bg-[#131d36]">
                      <Camera className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-500">#{photo.orderIndex || idx + 1}</span>
                    </div>
                  )}

                  {/* Photo Order Badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold border border-white/15 shadow-xs">
                    #{photo.orderIndex || idx + 1}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end text-white p-1.5 text-center">
                    <Camera className="w-3.5 h-3.5 mb-0.5 text-indigo-300" />
                    <span className="text-[10px] font-semibold leading-tight line-clamp-1">
                      {parentSubject ? parentSubject.name : 'View'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Active Field Management Options */}
      {currentField && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/70 dark:bg-[#131d36]/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Track Settings:
            </span>
            <span>{currentField.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {canMoveFieldLeft && (
              <button
                type="button"
                onClick={() => onMoveFieldLeft(currentField)}
                title="Move track left"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-200/70 dark:hover:bg-[#1a2647] text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {canMoveFieldRight && (
              <button
                type="button"
                onClick={() => onMoveFieldRight(currentField)}
                title="Move track right"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-200/70 dark:hover:bg-[#1a2647] text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 className="w-3 h-3" />}
              onClick={() => onEditField(currentField)}
              className="text-xs"
            >
              Edit Track
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-3 h-3 text-rose-500" />}
              onClick={() => onDeleteField(currentField)}
              className="text-xs hover:border-rose-500 hover:text-rose-600"
            >
              Delete Track
            </Button>
          </div>
        </div>
      )}

      {/* 7. Subtle Easy Study Snap Footer */}
      <footer className="pt-4 pb-2 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
        <p>Easy Study Snap • Digital Board Notebook</p>
      </footer>

      {/* Photo Preview Modal if user clicks on a thumbnail */}
      {selectedPhotoPreview && (
        <div
          id="recent-photo-preview-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          {(() => {
            const previewSrc =
              selectedPhotoPreview.localDataUrl ||
              selectedPhotoPreview.originalDataUrl ||
              selectedPhotoPreview.thumbnailUrl ||
              selectedPhotoPreview.cloudUrl;
            const previewChapter = chapters.find((c) => c.id === selectedPhotoPreview.chapterId);
            const previewSubject = previewChapter
              ? subjects.find((s) => s.id === previewChapter.subjectId)
              : undefined;

            const handleDownload = () => {
              if (!previewSrc) return;
              const link = document.createElement('a');
              link.href = previewSrc;
              link.download = `EasyStudySnap_${previewSubject?.name || 'Board'}_Photo${selectedPhotoPreview.orderIndex || 1}.jpg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div
                className="max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 p-4 relative flex flex-col items-center shadow-2xl gap-3 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Chapter & Subject Info */}
                <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-[11px] font-bold uppercase tracking-wider text-white">
                        Photo #{selectedPhotoPreview.orderIndex}
                      </span>
                      {previewSubject && (
                        <span className="text-xs text-slate-400 truncate">
                          {previewSubject.name} {previewChapter ? `• Ch. ${previewChapter.chapterNumber}` : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {previewChapter?.title || selectedPhotoPreview.fileName || 'Board Snapshot'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {previewSrc && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download className="w-3.5 h-3.5" />}
                        onClick={handleDownload}
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
                      >
                        Save
                      </Button>
                    )}
                    <button
                      type="button"
                      id="close-recent-photo-modal-btn"
                      onClick={() => setSelectedPhotoPreview(null)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Main Snapshot Display */}
                <div className="w-full bg-black/60 rounded-2xl p-2 flex items-center justify-center min-h-[250px] max-h-[65vh] overflow-hidden">
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={selectedPhotoPreview.fileName || 'Board snapshot'}
                      className="max-h-[60vh] max-w-full w-auto object-contain rounded-xl shadow-lg border border-white/10"
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-slate-500" />
                      <p className="text-sm font-medium">Image data not available</p>
                    </div>
                  )}
                </div>

                {/* Footer with actions */}
                <div className="flex items-center justify-between w-full pt-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Captured {new Date(selectedPhotoPreview.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {previewChapter && previewSubject && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setSelectedPhotoPreview(null);
                          onSelectChapter(previewChapter, previewSubject);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                      >
                        Go to Chapter
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPhotoPreview(null)}
                      className="text-white hover:bg-slate-800 text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
