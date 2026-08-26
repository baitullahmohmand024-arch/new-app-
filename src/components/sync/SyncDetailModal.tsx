import React, { useState } from 'react';
import { SyncProgress, UserProfile, UserSettings } from '../../types';
import { SyncService } from '../../services/syncEngine';
import { CloudBackendService } from '../../services/cloudBackend';
import { StorageService } from '../../services/storage';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  HardDrive,
  Smartphone,
  Tablet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

interface SyncDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SyncProgress;
  user: UserProfile;
  settings: UserSettings;
  onRefreshData: () => void;
}

export const SyncDetailModal: React.FC<SyncDetailModalProps> = ({
  isOpen,
  onClose,
  progress,
  user,
  settings,
  onRefreshData,
}) => {
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(CloudBackendService.isSimulatedOffline());

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await SyncService.performSync({
      onComplete: () => {
        onRefreshData();
      },
    });
    setIsManualSyncing(false);
  };

  const handleToggleNetwork = (simulateOffline: boolean) => {
    CloudBackendService.setSimulatedNetwork(!simulateOffline);
    setIsOfflineSimulated(simulateOffline);
  };

  const handleSwitchDevice = async (newDeviceId: string) => {
    await SyncService.switchSimulatedDevice(newDeviceId, user.id);
    onRefreshData();
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentOnline = progress.isOnline;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col max-h-[90vh] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Cloud Sync & Data Safety
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Offline-First Google Account Backup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Sync Status Hero Card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
              progress.status === 'synced'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-200'
                : progress.status === 'syncing'
                ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-950 dark:text-indigo-200'
                : !isCurrentOnline
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-950 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {progress.status === 'synced' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : progress.status === 'syncing' ? (
                <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
              ) : !isCurrentOnline ? (
                <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="font-bold text-sm">
                {progress.status === 'synced'
                  ? 'All Study Material Synced'
                  : progress.status === 'syncing'
                  ? `Synchronizing ${progress.currentEntity || 'items'}...`
                  : !isCurrentOnline
                  ? 'Offline Mode Active'
                  : `${progress.totalPending} items waiting to synchronize`}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {progress.status === 'synced'
                  ? 'Your fields, subjects, chapters, and board photos are backed up to your Google account.'
                  : !isCurrentOnline
                  ? 'No internet connection. You can continue capturing, editing, and studying. Changes will sync automatically when reconnected.'
                  : 'New classroom material is ready to be uploaded to your cloud storage.'}
              </p>
            </div>
          </div>

          {/* Sync Information Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Network Status
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                {isCurrentOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Online Connected
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    No Internet (Offline)
                  </>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Last Cloud Sync
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {formatLastSync(progress.lastSyncedAt)}
              </div>
            </div>
          </div>

          {/* Classroom Offline Testing Simulator */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOfflineSimulated ? (
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Wifi className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Classroom Offline Simulator
                </span>
              </div>
              <Badge variant={isOfflineSimulated ? 'warning' : 'primary'}>
                {isOfflineSimulated ? 'Simulated Offline' : 'Live Online'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Toggle this switch to simulate sitting in a classroom with zero Wi-Fi or mobile data. You can capture photos, create chapters, and edit them. When toggled back on, sync executes automatically.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleToggleNetwork(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  !isOfflineSimulated
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Online Mode
              </button>
              <button
                type="button"
                onClick={() => handleToggleNetwork(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  isOfflineSimulated
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Simulate Classroom Offline
              </button>
            </div>
          </div>

          {/* Multi-Device Testing Simulator */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                Multi-Device Switcher
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {settings.simulatedDeviceId || 'device_phone_a'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Simulate opening your Easy Study Snap account on another student device to test multi-device recovery:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSwitchDevice('device_phone_a')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  (settings.simulatedDeviceId || 'device_phone_a') === 'device_phone_a'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <Smartphone className="w-3.5 h-3.5" /> Phone A (Primary)
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchDevice('device_tablet_b')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                  settings.simulatedDeviceId === 'device_tablet_b'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <Tablet className="w-3.5 h-3.5" /> Tablet B (Study Desk)
                </div>
              </button>
            </div>
          </div>

          {/* Privacy & Isolation Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              All data is strictly bound to <strong>{user.email}</strong>. No other student can view or modify your notes.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            id="sync-now-modal-btn"
            variant="primary"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />}
            disabled={isManualSyncing || !isCurrentOnline}
            onClick={handleManualSync}
          >
            {isManualSyncing ? 'Synchronizing...' : 'Sync Now'}
          </Button>
        </div>
      </div>
    </div>
  );
};
