import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  if (!isOpen) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === 'delete';

  const handleDelete = () => {
    if (!isConfirmed) return;
    onConfirm();
    onClose();
  };

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
                Delete Account
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
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              This action is permanent and cannot be undone.
            </p>
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div>Deleting your account ({userEmail}) will permanently erase:</div>
              <ul className="list-disc list-inside space-y-0.5 ml-1 opacity-90">
                <li>All subjects and chapters</li>
                <li>All board photographs</li>
                <li>All generated PDFs and trash records</li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Type <span className="text-rose-600 font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="confirm-delete-account-btn"
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              disabled={!isConfirmed}
              onClick={handleDelete}
            >
              Permanently Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
