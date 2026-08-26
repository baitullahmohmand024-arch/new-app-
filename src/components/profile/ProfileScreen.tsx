import React, { useState, useEffect } from 'react';
import { UserProfile, AcademicField, UserSettings, SyncProgress, ThemeMode, Subject } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SignOutModal } from '../modals/SignOutModal';
import { DeleteAccountModal } from '../modals/DeleteAccountModal';
import { ContactHelpModal } from '../settings/ContactHelpModal';
import { SendFeedbackModal } from '../settings/SendFeedbackModal';
import { AboutDeveloperModal } from '../settings/AboutDeveloperModal';
import { AboutAppModal } from '../settings/AboutAppModal';
import { PrivacyPolicyModal } from '../settings/PrivacyPolicyModal';
import { TermsOfUseModal } from '../settings/TermsOfUseModal';
import { AppPermissionsModal } from '../settings/AppPermissionsModal';
import { SyncService } from '../../services/syncEngine';
import { CloudBackendService } from '../../services/cloudBackend';
import { StorageBreakdownService, StorageUsageStats } from '../../services/storageBreakdown';
import { APP_LOGO_URL } from '../../utils/branding';
import developerPhoto from '../../assets/images/developer_portrait_1787673845615.jpg';
import {
  User,
  Mail,
  ShieldCheck,
  HardDrive,
  WifiOff,
  LogOut,
  Trash2,
  Calendar,
  Lock,
  GraduationCap,
  Cloud,
  RefreshCw,
  CheckCircle2,
  Clock,
  Wifi,
  Smartphone,
  Tablet,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  Layers,
  FileText,
  Image as ImageIcon,
  Info,
  Check,
  HelpCircle,
  Edit3,
  Hash,
  X,
  MessageCircle,
  Shield,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  fields: AcademicField[];
  subjects?: Subject[];
  settings: UserSettings;
  syncProgress?: SyncProgress;
  onUpdateField: (fieldId: string) => void;
  onUpdateSettings?: (newSettings: Partial<UserSettings>) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onRefreshData?: () => void;
  onOpenTrash?: () => void;
  onNavigateToStudy?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  fields,
  subjects = [],
  settings,
  syncProgress,
  onUpdateField,
  onUpdateSettings,
  onUpdateProfile,
  onSignOut,
  onDeleteAccount,
  onRefreshData,
  onOpenTrash,
  onNavigateToStudy,
}) => {
  // Modal states
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isContactHelpOpen, setIsContactHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutDeveloperOpen, setIsAboutDeveloperOpen] = useState(false);
  const [isAboutAppOpen, setIsAboutAppOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(user.name || '');
  const [editFatherName, setEditFatherName] = useState(user.fatherName || '');
  const [editRollNumber, setEditRollNumber] = useState(user.rollNumber || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync & Storage states
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(CloudBackendService.isSimulatedOffline());
  const [storageStats, setStorageStats] = useState<StorageUsageStats | null>(null);

  const currentField = fields.find((f) => f.id === user.selectedFieldId) || fields[0];
  const fieldSubjects = subjects.filter((s) => s.fieldId === currentField?.id && !s.isDeleted);

  const DEVELOPER_PHONE = '03439406862';
  const DEVELOPER_EMAIL = 'baitullahmohmand024@gmail.com';
  const WHATSAPP_INTL = '923439406862';

  // Load storage usage
  useEffect(() => {
    let isMounted = true;
    StorageBreakdownService.calculateStorageUsage(user.id).then((stats) => {
      if (isMounted) setStorageStats(stats);
    });
    return () => {
      isMounted = false;
    };
  }, [user.id, syncProgress?.lastSyncedAt]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatLastSync = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'Never';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    await SyncService.performSync({
      onComplete: () => {
        if (onRefreshData) onRefreshData();
        StorageBreakdownService.calculateStorageUsage(user.id).then(setStorageStats);
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
    if (onRefreshData) onRefreshData();
  };

  const handleThemeChange = (mode: ThemeMode) => {
    if (!onUpdateSettings) return;
    if (mode === 'dark') {
      onUpdateSettings({ isDarkMode: true, themeMode: 'dark' });
    } else if (mode === 'light') {
      onUpdateSettings({ isDarkMode: false, themeMode: 'light' });
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      onUpdateSettings({ isDarkMode: prefersDark, themeMode: 'system' });
    }
  };

  const isOnline = syncProgress?.isOnline ?? CloudBackendService.isOnline();
  const pendingCount = syncProgress?.totalPending ?? 0;
  const currentThemeMode: ThemeMode = settings.themeMode || (settings.isDarkMode ? 'dark' : 'light');

  const handleDirectWhatsApp = () => {
    const text = encodeURIComponent('Hello Bait Ullah, I need help with Easy Study Snap.');
    const url = `https://wa.me/${WHATSAPP_INTL}?text=${text}`;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = url;
    }
  };

  const handleDirectEmail = () => {
    const subject = encodeURIComponent('Easy Study Snap — Help & Support');
    const body = encodeURIComponent(`Hello Bait Ullah,

I need help with Easy Study Snap.

My question or issue:
[Type here]

Student: ${user.name} (${user.email})
Thank you.`);
    window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your account, study track, storage, support, and legal information.
          </p>
        </div>

        <Button
          id="profile-top-signout-btn"
          variant="outline"
          size="sm"
          icon={<LogOut className="w-3.5 h-3.5" />}
          onClick={() => setIsSignOutOpen(true)}
        >
          Sign Out
        </Button>
      </div>

      {/* ========================================================
          1. ACCOUNT SECTION
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          <User className="w-3.5 h-3.5 text-indigo-500" />
          <span>Account</span>
        </div>

        {/* 1.1 STUDENT IDENTITY & GOOGLE ACCOUNT CARD */}
        <Card className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 border-indigo-100 dark:border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Student Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-indigo-600/20 overflow-hidden border-2 border-white dark:border-slate-800">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs"
                  title="Verified Google Account"
                >
                  <ShieldCheck className="w-3 h-3" />
                </span>
              </div>

              {/* Name & Google Account Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {user.name}
                  </h2>
                  <Badge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>
                    Google Account
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Member since {formatDate(user.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    UID: {user.id.slice(0, 12)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              id="btn-edit-student-profile"
              variant="outline"
              size="sm"
              icon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditName(user.name || '');
                setEditFatherName(user.fatherName || '');
                setEditRollNumber(user.rollNumber || '');
                setIsEditProfileOpen(true);
              }}
            >
              Edit Info
            </Button>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Student Name
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {user.name || 'Not specified'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Father's Name
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {user.fatherName || 'Not specified'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Roll Number
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {user.rollNumber ? `#${user.rollNumber}` : 'None (Optional)'}
              </p>
            </div>
          </div>
        </Card>

        {/* 1.2 BACKUP & CLOUD SYNC */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Backup & Synchronization
              </h3>
            </div>
            <Button
              id="profile-sync-now-btn"
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />}
              disabled={isManualSyncing || !isOnline}
              onClick={handleManualSync}
            >
              {isManualSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              syncProgress?.status === 'synced'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                : !isOnline
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                : 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {syncProgress?.status === 'synced' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : !isOnline ? (
                <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {syncProgress?.status === 'synced'
                    ? 'All local material backed up to cloud'
                    : !isOnline
                    ? 'Offline mode (Changes saved locally on device)'
                    : `${pendingCount} item(s) pending sync`}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Last synced: {formatLastSync(syncProgress?.lastSyncedAt)}
                </div>
              </div>
            </div>

            <Badge variant={isOnline ? 'success' : 'warning'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {/* Network Simulator */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {isOfflineSimulated ? (
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  Classroom Offline Simulator
                </div>
                <div className="text-[11px] text-slate-500">
                  Test offline note taking in lecture halls with zero Wi-Fi
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  id="network-online-btn"
                  onClick={() => handleToggleNetwork(false)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    !isOfflineSimulated
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  id="network-offline-btn"
                  onClick={() => handleToggleNetwork(true)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    isOfflineSimulated
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* 1.3 STORAGE USAGE BREAKDOWN */}
        <Card className="space-y-4 p-5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Storage Breakdown
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
                Total: {storageStats?.formattedTotal || 'Calculating...'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Board Photos
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {storageStats?.formattedPhotos || '0 KB'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {storageStats?.photoCount || 0} photos indexed
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Compiled PDFs
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {storageStats?.formattedPdfs || '0 KB'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {storageStats?.pdfCount || 0} documents cached
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Notes & Metadata
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {storageStats?.formattedMetadata || '0 KB'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {storageStats?.chapterCount || 0} chapters, {storageStats?.subjectCount || 0} subjects
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 1.4 TRASH & RECOVERY */}
        {onOpenTrash && (
          <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Recently Deleted Items Vault</span>
                <Badge variant="neutral">30-Day Safe Retention</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Restore or permanently purge soft-deleted chapters, board photos, and PDFs.
              </p>
            </div>

            <Button
              id="profile-open-trash-btn"
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5 text-indigo-600" />}
              onClick={onOpenTrash}
            >
              Open Trash Vault
            </Button>
          </Card>
        )}

        {/* 1.5 DATA ISOLATION */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Strict Student Data Isolation
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All board captures, chapters, and generated PDFs created under <strong>{user.email}</strong> are strictly isolated and cryptographically scoped to your user ID ({user.id.slice(0, 12)}).
          </p>
        </div>
      </div>

      {/* ========================================================
          2. APP SECTION
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          <span>App</span>
        </div>

        {/* 2.1 APPEARANCE */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Appearance & Theme
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize reading contrast for optimal board readability in lecture halls.
          </p>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              id="theme-option-light"
              onClick={() => handleThemeChange('light')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                currentThemeMode === 'light'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Light</div>
              {currentThemeMode === 'light' && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </button>

            <button
              id="theme-option-dark"
              onClick={() => handleThemeChange('dark')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                currentThemeMode === 'dark'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">Dark</div>
              {currentThemeMode === 'dark' && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </button>

            <button
              id="theme-option-system"
              onClick={() => handleThemeChange('system')}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                currentThemeMode === 'system'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">System</div>
              {currentThemeMode === 'system' && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}
            </button>
          </div>
        </Card>

        {/* 2.2 MANAGE SUBJECTS & ACADEMIC TRACK */}
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Academic Stream & Subjects
            </h3>
            {onNavigateToStudy && (
              <button
                onClick={onNavigateToStudy}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Manage Subjects →
              </button>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Active Field of Study
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {fields.map((field) => {
                const isSelected = field.id === user.selectedFieldId;
                return (
                  <button
                    key={field.id}
                    id={`field-track-btn-${field.id}`}
                    onClick={() => onUpdateField(field.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between">
                      <span>{field.name}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {field.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subjects in current track */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Subjects in {currentField?.name || 'Current Track'}
              </span>
              <span className="text-[11px] text-slate-500">
                {fieldSubjects.length} subject{fieldSubjects.length !== 1 ? 's' : ''} configured
              </span>
            </div>

            {fieldSubjects.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {fieldSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    <Layers className="w-3 h-3 text-slate-400" />
                    {sub.name}
                    <span className="text-[10px] text-slate-400">({sub.chapterCount || 0} ch)</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No subjects configured in this track yet.
              </div>
            )}
          </div>
        </Card>

        {/* 2.3 DEVICE PERMISSIONS TILE */}
        <Card
          onClick={() => setIsPermissionsOpen(true)}
          className="p-4 flex items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Device Permissions
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Camera, Photo Gallery, and Local Storage on-demand access explanations
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Card>
      </div>

      {/* ========================================================
          3. SUPPORT SECTION
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>Support</span>
        </div>

        {/* Support Hub Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Help & Student Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Have a question or running into an issue? Contact developer directly.
              </p>
            </div>
          </div>

          {/* Direct Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-98 transition-all flex flex-col items-start gap-1.5 cursor-pointer group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                WhatsApp Help
              </div>
              <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                {DEVELOPER_PHONE}
              </div>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={handleDirectEmail}
              className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-98 transition-all flex flex-col items-start gap-1.5 cursor-pointer group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-blue-950 dark:text-blue-200">
                Email Support
              </div>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400 truncate max-w-full">
                {DEVELOPER_EMAIL}
              </div>
            </button>

            {/* In-app Feedback Form */}
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 active:scale-98 transition-all flex flex-col items-start gap-1.5 cursor-pointer group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                Send Feedback
              </div>
              <div className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
                Report bug or request feature
              </div>
            </button>
          </div>

          {/* Developer Quick Identity Line */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Developer: <strong>Bait ullah</strong> • District Mohmand, Pandiali</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAboutDeveloperOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Developer Profile →
            </button>
          </div>
        </Card>
      </div>

      {/* ========================================================
          4. LEGAL SECTION
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          <span>Legal</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Privacy Policy Card */}
          <Card
            onClick={() => setIsPrivacyOpen(true)}
            className="p-4 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Privacy Policy
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data protection, encryption, and zero advertising policy
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Card>

          {/* Terms of Use Card */}
          <Card
            onClick={() => setIsTermsOpen(true)}
            className="p-4 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Terms of Use
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Educational platform guidelines & acceptable use
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </div>
      </div>

      {/* ========================================================
          5. ABOUT SECTION
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          <Info className="w-3.5 h-3.5 text-amber-500" />
          <span>About</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* About App Card */}
          <Card
            onClick={() => setIsAboutAppOpen(true)}
            className="p-4 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center p-2.5 text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <img
                  src={APP_LOGO_URL}
                  alt="Easy Study Snap Logo"
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Easy Study Snap
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    v1.0.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  Capture • Organize • Study
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Card>

          {/* About Developer Card */}
          <Card
            onClick={() => setIsAboutDeveloperOpen(true)}
            className="p-4 flex items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30 bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src={developerPhoto}
                  alt="Bait ullah"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Bait ullah
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Developer & Creator • District Mohmand
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Card>
        </div>
      </div>

      {/* ========================================================
          6. ACCOUNT ACTIONS & DANGER ZONE
      ======================================================== */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
          Account Actions & Danger Zone
        </h3>

        <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sign out safely closes your session on this device. Deleting your account is irreversible and purges all study records permanently.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              id="profile-signout-btn"
              variant="secondary"
              size="md"
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => setIsSignOutOpen(true)}
              className="flex-1"
            >
              Sign Out of Easy Study Snap
            </Button>

            <Button
              id="profile-delete-account-btn"
              variant="danger"
              size="md"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setIsDeleteOpen(true)}
              className="flex-1"
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ALL MODALS
      ======================================================== */}
      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Edit Student Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editName.trim() || !editFatherName.trim()) return;
                setIsSavingProfile(true);
                if (onUpdateProfile) {
                  onUpdateProfile({
                    name: editName.trim(),
                    fatherName: editFatherName.trim(),
                    rollNumber: editRollNumber.trim() || undefined,
                  });
                }
                setIsSavingProfile(false);
                setIsEditProfileOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Father's Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFatherName}
                  onChange={(e) => setEditFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Roll Number (Optional)
                </label>
                <input
                  type="text"
                  value={editRollNumber}
                  onChange={(e) => setEditRollNumber(e.target.value)}
                  placeholder="e.g. 4028 (Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditProfileOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSavingProfile || !editName.trim() || !editFatherName.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support & Legal & About Modals */}
      <ContactHelpModal
        isOpen={isContactHelpOpen}
        onClose={() => setIsContactHelpOpen(false)}
        onOpenSendFeedback={() => setIsFeedbackOpen(true)}
      />

      <SendFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        userEmail={user.email}
      />

      <AboutDeveloperModal
        isOpen={isAboutDeveloperOpen}
        onClose={() => setIsAboutDeveloperOpen(false)}
      />

      <AboutAppModal
        isOpen={isAboutAppOpen}
        onClose={() => setIsAboutAppOpen(false)}
        onOpenDeveloper={() => setIsAboutDeveloperOpen(true)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsOfUseModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      <AppPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
      />

      {/* Sign Out & Delete Modals */}
      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={onSignOut}
        pendingSyncCount={pendingCount}
      />

      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={onDeleteAccount}
        userEmail={user.email}
      />
    </div>
  );
};
