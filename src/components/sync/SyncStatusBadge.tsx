import React from 'react';
import { SyncProgress } from '../../types';
import { CheckCircle2, RefreshCw, Clock, WifiOff, AlertTriangle } from 'lucide-react';

interface SyncStatusBadgeProps {
  progress: SyncProgress;
  onClick: () => void;
  className?: string;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ progress, onClick, className = '' }) => {
  const { status, totalPending, syncedCount, isOnline } = progress;

  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  let text = 'All Synced';
  let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';

  if (!isOnline || status === 'waiting_for_network') {
    icon = <WifiOff className="w-3.5 h-3.5 text-amber-500" />;
    text = totalPending > 0 ? `${totalPending} waiting for Wi-Fi` : 'Offline Mode';
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
  } else if (status === 'syncing') {
    icon = <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />;
    text = progress.currentEntity ? `Syncing ${progress.currentEntity}...` : 'Syncing...';
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50';
  } else if (totalPending > 0 || status === 'pending') {
    icon = <Clock className="w-3.5 h-3.5 text-indigo-500" />;
    text = `${totalPending} ${totalPending === 1 ? 'item' : 'items'} waiting to sync`;
    badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  } else if (status === 'error') {
    icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
    text = 'Sync paused';
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50';
  }

  return (
    <button
      id="sync-status-badge-btn"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xs ${badgeStyle} ${className}`}
      title="Click to view Cloud Synchronization status"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};
