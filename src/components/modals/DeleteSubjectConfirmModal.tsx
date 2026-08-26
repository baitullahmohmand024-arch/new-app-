import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Subject } from '../../types';

interface DeleteSubjectConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  onConfirm: (subjectId: string) => void;
}

export const DeleteSubjectConfirmModal: React.FC<DeleteSubjectConfirmModalProps> = ({
  isOpen,
  onClose,
  subject,
  onConfirm,
}) => {
  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Delete Subject: {subject.name}?
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong>{subject.name}</strong> from your academic workspace?
            </p>

            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div>This action will remove:</div>
              <ul className="list-disc list-inside space-y-0.5 ml-1 opacity-90">
                <li>The subject card and configuration</li>
                <li>Any associated chapter indexes for this subject</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="confirm-delete-subject-btn"
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                onConfirm(subject.id);
                onClose();
              }}
            >
              Delete Subject
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
