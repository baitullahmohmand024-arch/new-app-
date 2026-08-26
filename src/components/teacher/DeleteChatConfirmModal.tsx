import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteChatConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle: string;
}

export const DeleteChatConfirmModal: React.FC<DeleteChatConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chatTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Delete Study Session?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">"{chatTitle}"</span>? This will permanently remove all messages and practice questions in this conversation.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
