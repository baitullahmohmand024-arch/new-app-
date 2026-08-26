import React from 'react';
import { Chapter } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  CheckCircle2,
  Circle,
  Camera,
  FileText,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ChapterCardProps {
  chapter: Chapter;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (chapter: Chapter) => void;
  onToggleComplete: (chapterId: string) => void;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
  onMoveUp: (chapter: Chapter) => void;
  onMoveDown: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  canMoveUp,
  canMoveDown,
  onSelect,
  onToggleComplete,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <Card
      id={`chapter-card-${chapter.id}`}
      interactive
      className={`relative group transition-all duration-200 border ${
        chapter.isCompleted
          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/70 dark:border-emerald-800/40 hover:border-emerald-400/80 dark:hover:border-emerald-700/60'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-500/70'
      } p-4 sm:p-5`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Section: Chapter Number Badge, Completion Checkbox, Title & Metadata */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Quick Toggle Completion Button */}
          <button
            type="button"
            id={`toggle-complete-btn-${chapter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(chapter.id);
            }}
            title={chapter.isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
            className={`mt-0.5 sm:mt-0 p-1.5 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer shrink-0 ${
              chapter.isCompleted
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/50'
                : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {chapter.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 animate-checkmark-pop text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Chapter Number Badge & Title */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onSelect(chapter)}
          >
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Ch. {chapter.chapterNumber}
              </span>

              {chapter.isCompleted ? (
                <Badge variant="success" className="text-[11px]">
                  ✓ Completed
                </Badge>
              ) : (
                <Badge variant="neutral" className="text-[11px]">
                  In Progress
                </Badge>
              )}
            </div>

            {/* Chapter Title */}
            <h3
              className={`text-base sm:text-lg font-semibold truncate transition-colors duration-150 ${
                chapter.isCompleted
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
              }`}
            >
              {chapter.title}
            </h3>

            {/* Future Metadata Placeholders (Photos & PDFs) */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                {chapter.photoCount > 0
                  ? `${chapter.photoCount} photo${chapter.photoCount === 1 ? '' : 's'}`
                  : '0 photos'}
              </span>

              <span className="text-slate-300 dark:text-slate-700">•</span>

              <span className="inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {chapter.pdfGenerated ? (
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">PDF Ready</span>
                ) : (
                  <span>No PDF yet</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Controls & Navigation */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Reorder Buttons (Move Up / Down) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              id={`move-up-btn-${chapter.id}`}
              disabled={!canMoveUp}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(chapter);
              }}
              title="Move Chapter Up"
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 active:scale-90 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id={`move-down-btn-${chapter.id}`}
              disabled={!canMoveDown}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(chapter);
              }}
              title="Move Chapter Down"
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 active:scale-90 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Edit / Rename Button */}
          <button
            type="button"
            id={`edit-chapter-btn-${chapter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(chapter);
            }}
            title="Rename Chapter"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-150 active:scale-90 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            id={`delete-chapter-btn-${chapter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chapter);
            }}
            title="Delete Chapter"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 transition-all duration-150 active:scale-90 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Open Chapter Workspace Button */}
          <button
            type="button"
            id={`open-chapter-btn-${chapter.id}`}
            onClick={() => onSelect(chapter)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition-all duration-150 active:scale-95 ml-1 cursor-pointer"
          >
            Open
            <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
