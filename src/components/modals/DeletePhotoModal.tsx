import React from 'react';
import { BoardPhoto, Chapter } from '../../types';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '../common/Button';

interface DeletePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: BoardPhoto | null;
  chapter: Chapter;
  onConfirm: (photoId: string) => void;
}

export const DeletePhotoModal: React.FC<DeletePhotoModalProps> = ({
  isOpen,
  onClose,
  photo,
  chapter,
  onConfirm,
}) => {
  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="delete-photo-confirm-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <button
            type="button"
            id="close-delete-photo-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Move to Recently Deleted?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            This board photograph (#<strong>{photo.orderIndex}</strong>) will be removed from{' '}
            <strong>Chapter {chapter.chapterNumber}: {chapter.title}</strong> and moved to Recently Deleted.
          </p>
        </div>

        {/* Thumbnail Preview in deletion dialog */}
        {photo.thumbnailUrl && (
          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center gap-3 border border-slate-200 dark:border-slate-700/60">
            <img
              src={photo.thumbnailUrl}
              alt="Snapshot to delete"
              className="w-16 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
            />
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Board Photo #{photo.orderIndex}</span>
              <div>Captured {new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        )}

        <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <span>🛡️ Safe 30-Day Recovery</span>
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-normal">
            This snapshot will remain protected in <strong>Recently Deleted</strong> for <strong>30 days</strong>. You can restore it anytime back to this chapter.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="cancel-delete-photo-btn"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            id="confirm-delete-photo-btn"
            variant="danger"
            size="md"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              onConfirm(photo.id);
              onClose();
            }}
          >
            Move to Trash
          </Button>
        </div>
      </div>
    </div>
  );
};
