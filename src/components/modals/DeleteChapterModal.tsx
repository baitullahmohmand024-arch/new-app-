import React from 'react';
import { Chapter } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { X, Trash2, AlertTriangle, Info } from 'lucide-react';

interface DeleteChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onConfirm: (chapterId: string) => void;
}

export const DeleteChapterModal: React.FC<DeleteChapterModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onConfirm,
}) => {
  if (!isOpen || !chapter) return null;

  return (
    <div
      id="delete-chapter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md">
        <Card
          id="delete-chapter-modal-content"
          className="shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Move Chapter to Recently Deleted?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Protected 30-Day Retention
                </p>
              </div>
            </div>
            <button
              id="close-delete-chapter-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Move{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">
                "Ch. {chapter.chapterNumber} — {chapter.title}"
              </strong>{' '}
              to Recently Deleted?
            </p>

            <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-1 text-xs text-indigo-900 dark:text-indigo-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>30-Day Safe Recovery Guarantee</span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                This chapter and its <strong>{chapter.photoCount} board snapshots</strong> will remain safely recoverable in <strong>Recently Deleted</strong> for <strong>30 days</strong>. You can restore everything back to this subject at any time.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              id="cancel-delete-chapter-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-chapter-btn"
              type="button"
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                onConfirm(chapter.id);
                onClose();
              }}
            >
              Move to Trash
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
