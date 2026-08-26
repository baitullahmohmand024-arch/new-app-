import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LogOut, X, AlertTriangle, Cloud, CheckCircle2 } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingSyncCount?: number;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  pendingSyncCount = 0,
}) => {
  if (!isOpen) return null;

  const hasUnsynced = pendingSyncCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${hasUnsynced ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center`}>
                {hasUnsynced ? <AlertTriangle className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Sign Out
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {hasUnsynced ? (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <div className="font-bold">
                    {pendingSyncCount} unsynced study item{pendingSyncCount > 1 ? 's' : ''} detected
                  </div>
                  <div>
                    Your notes remain safely saved on this device, but have not yet completed cloud backup. If you sign in on another device before syncing, recent changes won't appear there.
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can proceed with sign out now, or cancel and tap <strong>Sync Now</strong> first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>All local board snapshots and PDFs are backed up.</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to sign out? Your study notes and board photographs will remain safely saved under your account.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              id="confirm-signout-btn"
              variant={hasUnsynced ? "danger" : "secondary"}
              size="sm"
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
