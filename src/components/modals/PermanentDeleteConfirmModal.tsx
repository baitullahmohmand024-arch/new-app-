import React from 'react';
import { Trash2, AlertOctagon, X } from 'lucide-react';
import { Button } from '../common/Button';

interface PermanentDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemCount?: number;
  isProcessing?: boolean;
}

export const PermanentDeleteConfirmModal: React.FC<PermanentDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemCount,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="permanent-delete-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="permanent-delete-modal-container"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <button
            type="button"
            id="close-perm-delete-modal-btn"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Permanent Deletion Warning</span>
          </div>
          <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-normal">
            This action cannot be undone. {itemCount && itemCount > 1 ? `All ${itemCount} items` : 'This item'} will be permanently destroyed and cannot be recovered later.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            id="cancel-perm-delete-btn"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button
            id="confirm-perm-delete-btn"
            variant="danger"
            size="md"
            icon={<Trash2 className="w-4 h-4" />}
            disabled={isProcessing}
            onClick={onConfirm}
          >
            {isProcessing ? 'Deleting Forever...' : 'Delete Permanently'}
          </Button>
        </div>
      </div>
    </div>
  );
};
