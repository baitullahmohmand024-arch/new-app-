import React, { useState } from 'react';
import { Subject, AcademicField, Chapter } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ChapterCard } from '../chapter/ChapterCard';
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface SubjectDetailViewProps {
  subject: Subject;
  field: AcademicField | null;
  chapters: Chapter[];
  onBack: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onAddChapter: () => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  onToggleChapterComplete: (chapterId: string) => void;
  onMoveChapterUp: (chapter: Chapter) => void;
  onMoveChapterDown: (chapter: Chapter) => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  field,
  chapters,
  onBack,
  onEditSubject,
  onDeleteSubject,
  onSelectChapter,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onToggleChapterComplete,
  onMoveChapterUp,
  onMoveChapterDown,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chapters by search query
  const filteredChapters = chapters.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      `chapter ${c.chapterNumber}`.toLowerCase().includes(q) ||
      `ch. ${c.chapterNumber}`.toLowerCase().includes(q)
    );
  });

  const completedCount = chapters.filter((c) => c.isCompleted).length;
  const totalCount = chapters.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Back Navigation & Subject Actions */}
      <div className="flex items-center justify-between">
        <Button
          id="back-to-dashboard-btn"
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          All Subjects
        </Button>

        <div className="flex items-center gap-2">
          <Button
            id="subject-detail-edit-btn"
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => onEditSubject(subject)}
          >
            Edit Subject
          </Button>

          <Button
            id="subject-detail-delete-btn"
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            onClick={() => onDeleteSubject(subject)}
            className="hover:border-rose-500 hover:text-rose-600"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Subject Header Banner */}
      <Card
        id={`subject-header-banner-${subject.id}`}
        className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border-0 shadow-lg p-6 sm:p-7 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                {field?.name || 'Academic Field'}
              </span>
              {subject.isCustom && (
                <Badge variant="warning" className="text-[10px]">
                  Custom Subject
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {subject.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage chapters, classroom board snapshots, and lecture PDF notes for {subject.name}.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 dark:bg-black/30 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
            <div className="text-center">
              <div className="text-lg font-bold text-white leading-tight">{totalCount}</div>
              <div className="text-[10px] uppercase font-semibold text-slate-300">Chapters</div>
            </div>
            <div className="w-px h-7 bg-white/20" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400 leading-tight">
                {completedCount}
              </div>
              <div className="text-[10px] uppercase font-semibold text-slate-300">Completed</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Chapters Section Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Chapters
            </h2>
            <Badge variant="neutral" className="text-xs font-semibold">
              {totalCount} {totalCount === 1 ? 'Chapter' : 'Chapters'}
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            {totalCount > 0 && (
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* + Create Chapter Button */}
            <Button
              id="create-chapter-btn"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onAddChapter}
            >
              Create Chapter
            </Button>
          </div>
        </div>

        {/* Chapter List */}
        {filteredChapters.length > 0 ? (
          <div className="space-y-3">
            {filteredChapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                canMoveUp={index > 0}
                canMoveDown={index < filteredChapters.length - 1}
                onSelect={onSelectChapter}
                onToggleComplete={onToggleChapterComplete}
                onEdit={onEditChapter}
                onDelete={onDeleteChapter}
                onMoveUp={onMoveChapterUp}
                onMoveDown={onMoveChapterDown}
              />
            ))}
          </div>
        ) : searchQuery.trim() ? (
          /* Search Empty State */
          <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No chapters match "{searchQuery}"
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search Filter
            </Button>
          </Card>
        ) : (
          /* Empty State when Subject has no chapters */
          <Card className="p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No chapters yet in {subject.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Create your first chapter to organize your classroom board photos and study materials.
              </p>
            </div>

            <div className="pt-2">
              <Button
                id="create-first-chapter-btn"
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={onAddChapter}
              >
                Create Chapter 1
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Structural Hierarchy Educational Card */}
      <Card className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>
            Hierarchy: <strong>{field?.name}</strong> → <strong>{subject.name}</strong> → <strong>Chapters</strong> → <em>(Board Photos in Phase 6)</em>
          </span>
        </div>
        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
          Easy Study Snap Phase 5
        </span>
      </Card>
    </div>
  );
};
