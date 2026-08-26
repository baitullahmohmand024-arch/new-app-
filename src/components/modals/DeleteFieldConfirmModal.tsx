import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { AcademicField } from '../../types';

interface DeleteFieldConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: AcademicField | null;
  subjectCount: number;
  onConfirm: (fieldId: string) => void;
}

export const DeleteFieldConfirmModal: React.FC<DeleteFieldConfirmModalProps> = ({
  isOpen,
  onClose,
  field,
  subjectCount,
  onConfirm,
}) => {
  if (!isOpen || !field) return null;

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
                Delete Field: {field.name}?
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
              Are you sure you want to remove the <strong>{field.name}</strong> academic field track from your account?
            </p>

            {subjectCount > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ This field currently contains <strong>{subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}</strong>. Deleting this field will also remove its associated subjects from your view.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                This field has no subjects attached. It will be removed cleanly.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="confirm-delete-field-btn"
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                onConfirm(field.id);
                onClose();
              }}
            >
              Delete Field
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
