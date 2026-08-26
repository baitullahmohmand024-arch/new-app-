import React from 'react';
import { Camera, Moon, Sun, Sparkles, User, Search } from 'lucide-react';
import { Badge } from './Badge';
import { UserProfile, SyncProgress } from '../../types';
import { SyncStatusBadge } from '../sync/SyncStatusBadge';
import { APP_LOGO_URL } from '../../constants/branding';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  selectedFieldName: string;
  user: UserProfile | null;
  syncProgress?: SyncProgress;
  onOpenProfile: () => void;
  onOpenSyncDetail?: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  selectedFieldName,
  user,
  syncProgress,
  onOpenProfile,
  onOpenSyncDetail,
  onOpenSearch,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-indigo-600/20 border border-slate-200 dark:border-slate-800 transition-transform duration-200 hover:scale-105 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-center">
            <img
              src={APP_LOGO_URL}
              alt="Easy Study Snap Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-tight">
                Easy Study Snap
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Digital Board Notebook
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Search Header Button */}
          {onOpenSearch && (
            <button
              id="header-search-btn"
              onClick={onOpenSearch}
              aria-label="Search study material"
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 bg-slate-100/90 dark:bg-[#131d36] hover:bg-indigo-50 dark:hover:bg-[#1a2647] border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Search</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-white dark:bg-[#0f172a] text-slate-400 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Cloud Sync Status Badge */}
          {syncProgress && onOpenSyncDetail && (
            <SyncStatusBadge
              progress={syncProgress}
              onClick={onOpenSyncDetail}
              className="hidden sm:inline-flex"
            />
          )}

          {/* Current Academic Field Badge */}
          <Badge variant="primary" className="font-semibold hidden xs:inline-flex shadow-xs">
            {selectedFieldName}
          </Badge>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#131d36] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
          </button>

          {/* User Profile Avatar / Button */}
          {user && (
            <button
              id="header-profile-btn"
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-xl overflow-hidden border border-indigo-300/80 dark:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 hover:border-indigo-500 dark:hover:border-indigo-400 active:scale-95 shadow-xs cursor-pointer ring-1 ring-indigo-500/20"
              title={`${user.name} (${user.email})`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
