import React from 'react';
import { Subject, Chapter } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  ArrowLeft,
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  Circle,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ChapterWorkspaceViewProps {
  subject: Subject;
  chapter: Chapter;
  onBack: () => void;
  onToggleComplete: () => void;
}

export const ChapterWorkspaceView: React.FC<ChapterWorkspaceViewProps> = ({
  subject,
  chapter,
  onBack,
  onToggleComplete,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          id="back-to-subject-btn"
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          {subject.name} Chapters
        </Button>

        <Badge variant={chapter.isCompleted ? 'success' : 'neutral'}>
          {chapter.isCompleted ? 'Completed' : 'In Progress'}
        </Badge>
      </div>

      {/* Chapter Workspace Header Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Chapter {chapter.chapterNumber}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {subject.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {chapter.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {chapter.photoCount} board photographs attached
            </p>
          </div>

          {/* Completion Toggle Button */}
          <Button
            id="toggle-chapter-complete-btn"
            variant={chapter.isCompleted ? 'secondary' : 'outline'}
            size="sm"
            icon={
              chapter.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400" />
              )
            }
            onClick={onToggleComplete}
          >
            {chapter.isCompleted ? 'Mark as Incomplete' : 'Mark Completed'}
          </Button>
        </div>

        {/* Action Bar (Camera / Import / PDF) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Button
            id="action-capture-board-btn"
            variant="primary"
            size="md"
            icon={<Camera className="w-4 h-4" />}
            className="w-full"
            onClick={() => alert('Capture Camera feature will be activated in the next step!')}
          >
            Capture Board
          </Button>

          <Button
            id="action-import-gallery-btn"
            variant="secondary"
            size="md"
            icon={<Upload className="w-4 h-4" />}
            className="w-full"
            onClick={() => alert('Gallery Batch Import feature will be activated in the next step!')}
          >
            Import Photos
          </Button>

          <Button
            id="action-create-pdf-btn"
            variant="outline"
            size="md"
            icon={<FileText className="w-4 h-4" />}
            className="w-full"
            onClick={() => alert('Offline PDF Generator will be activated in the next step!')}
          >
            Create PDF
          </Button>
        </div>
      </Card>

      {/* Board Photographs Workspace Foundation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Board Photographs ({chapter.photoCount})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Sequential Board Order
          </span>
        </div>

        <Card className="text-center py-10 px-4 border-dashed bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Camera className="w-7 h-7" />
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Ready for Board Capture
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            In the upcoming Phase, this workspace will allow rapid classroom snapping, high-contrast enhancement, photo reordering, and one-click PDF generation.
          </p>
          <Badge variant="info" icon={<Sparkles className="w-3 h-3" />}>
            Phase 2 Project Foundation Ready
          </Badge>
        </Card>
      </div>
    </div>
  );
};
