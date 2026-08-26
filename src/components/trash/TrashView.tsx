import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, TrashedItem, TrashItemType } from '../../types';
import { TrashService, RETENTION_DAYS } from '../../services/trashService';
import { PermanentDeleteConfirmModal } from '../modals/PermanentDeleteConfirmModal';
import {
  Trash2,
  RotateCcw,
  Camera,
  FileText,
  Folder,
  Clock,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RefreshCw,
  HardDrive,
  Info,
  Calendar,
  FastForward,
} from 'lucide-react';

interface TrashViewProps {
  user: UserProfile;
  onNavigateToChapter?: (chapterId: string) => void;
  onNavigateToPdfs?: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  user,
  onNavigateToChapter,
  onNavigateToPdfs,
}) => {
  const [items, setItems] = useState<TrashedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | TrashItemType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'expiring' | 'title'>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toast / notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Permanent Delete Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemCount: number;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemCount: 0,
    action: async () => {},
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load items & run 30-day auto-purge on mount
  const loadTrashedItems = async () => {
    setIsLoading(true);
    try {
      // First, purge any items that have passed the 30-day window
      await TrashService.purgeAllExpiredItems(user.id);
      const data = await TrashService.getTrashedItems(user.id);
      setItems(data);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Failed to load trashed items', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrashedItems();
  }, [user.id]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchPath = item.locationPath.toLowerCase().includes(q);
          const matchSub = item.subtitle.toLowerCase().includes(q);
          return matchTitle || matchPath || matchSub;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.deletedAt - a.deletedAt;
        if (sortBy === 'expiring') return a.daysRemaining - b.daysRemaining;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, filterType, searchQuery, sortBy]);

  // Counts
  const countPhotos = useMemo(() => items.filter((i) => i.type === 'photo').length, [items]);
  const countPdfs = useMemo(() => items.filter((i) => i.type === 'pdf').length, [items]);
  const countChapters = useMemo(() => items.filter((i) => i.type === 'chapter').length, [items]);

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // RESTORE SINGLE ITEM
  const handleRestoreSingle = async (item: TrashedItem) => {
    setIsProcessing(true);
    try {
      const res = await TrashService.restoreItem(user.id, item.type, item.id);
      if (res.success) {
        showToast(res.message);
        await loadTrashedItems();
      } else {
        showToast(res.message, 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to restore item', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  // RESTORE BULK
  const handleRestoreBulk = async () => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    try {
      const selectedItems = items.filter((i) => selectedIds.has(i.id));
      const count = await TrashService.restoreBulk(
        user.id,
        selectedItems.map((i) => ({ type: i.type, id: i.id }))
      );
      showToast(`Restored ${count} ${count === 1 ? 'item' : 'items'} to original locations`);
      await loadTrashedItems();
    } catch (e: any) {
      showToast('Bulk restoration encountered an error', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  // PERMANENT DELETE SINGLE MODAL LAUNCH
  const promptPermanentDeleteSingle = (item: TrashedItem) => {
    setModalState({
      isOpen: true,
      title: `Permanently Delete ${item.type === 'photo' ? 'Snapshot' : item.type === 'pdf' ? 'PDF' : 'Chapter'}?`,
      description: `"${item.title}" will be permanently erased from your local storage and cloud account. This action cannot be reversed.`,
      itemCount: 1,
      action: async () => {
        setIsProcessing(true);
        try {
          await TrashService.permanentlyDeleteItem(user.id, item.type, item.id);
          showToast(`Permanently deleted "${item.title}"`);
          setModalState((prev) => ({ ...prev, isOpen: false }));
          await loadTrashedItems();
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // PERMANENT DELETE BULK MODAL LAUNCH
  const promptPermanentDeleteBulk = () => {
    if (selectedIds.size === 0) return;
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    setModalState({
      isOpen: true,
      title: `Permanently Delete ${selectedItems.length} Selected ${selectedItems.length === 1 ? 'Item' : 'Items'}?`,
      description: `All ${selectedItems.length} selected items will be destroyed forever. You will not be able to recover them.`,
      itemCount: selectedItems.length,
      action: async () => {
        setIsProcessing(true);
        try {
          const count = await TrashService.permanentlyDeleteBulk(
            user.id,
            selectedItems.map((i) => ({ type: i.type, id: i.id }))
          );
          showToast(`Permanently destroyed ${count} items`);
          setModalState((prev) => ({ ...prev, isOpen: false }));
          await loadTrashedItems();
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // EMPTY TRASH MODAL LAUNCH
  const promptEmptyTrash = () => {
    if (items.length === 0) return;
    setModalState({
      isOpen: true,
      title: 'Empty Entire Trash Vault?',
      description: `All ${items.length} items currently in Recently Deleted will be permanently destroyed. This operation is irreversible.`,
      itemCount: items.length,
      action: async () => {
        setIsProcessing(true);
        try {
          const count = await TrashService.emptyTrash(user.id);
          showToast(`Emptied trash (${count} items purged)`);
          setModalState((prev) => ({ ...prev, isOpen: false }));
          await loadTrashedItems();
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  // DEV TIME TRAVEL (FOR TESTING 30-DAY AUTO-PURGE)
  const handleFastForwardTime = async () => {
    setIsProcessing(true);
    try {
      await TrashService.simulateTimeTravel(user.id, 30);
      showToast('Fast-forwarded 30 days! Running automatic retention cleanup...');
      await loadTrashedItems();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 dark:border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Trash2 className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Recently Deleted</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Items remain safely recoverable for 30 days before permanent deletion
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {items.length > 0 && (
              <button
                type="button"
                id="empty-trash-btn"
                onClick={promptEmptyTrash}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Empty Trash
              </button>
            )}

            {/* Test Simulation Tool */}
            <button
              type="button"
              id="test-time-travel-btn"
              onClick={handleFastForwardTime}
              disabled={isProcessing || items.length === 0}
              title="Fast-forward timestamps 30 days to test automatic auto-purge"
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate 30 Days</span>
            </button>

            <button
              type="button"
              id="refresh-trash-btn"
              onClick={loadTrashedItems}
              disabled={isLoading || isProcessing}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills and Search */}
        <div className="max-w-6xl mx-auto mt-4 space-y-3">
          {/* Top Filter bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                id="filter-trash-all"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterType === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Items</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/50 dark:bg-slate-700">
                  {items.length}
                </span>
              </button>

              <button
                type="button"
                id="filter-trash-photos"
                onClick={() => setFilterType('photo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterType === 'photo'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/50 dark:bg-slate-700">
                  {countPhotos}
                </span>
              </button>

              <button
                type="button"
                id="filter-trash-pdfs"
                onClick={() => setFilterType('pdf')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterType === 'pdf'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDFs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/50 dark:bg-slate-700">
                  {countPdfs}
                </span>
              </button>

              <button
                type="button"
                id="filter-trash-chapters"
                onClick={() => setFilterType('chapter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterType === 'chapter'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Chapters</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/50 dark:bg-slate-700">
                  {countChapters}
                </span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                id="sort-trash-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="newest">Recently Deleted</option>
                <option value="expiring">Expiring Soonest</option>
                <option value="title">Item Title</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-trash-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recently deleted items by title, chapter, or subject..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 flex-1">
        {/* Bulk Selection Bar */}
        {filteredItems.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="select-all-trash-btn"
                onClick={selectAll}
                className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              >
                {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {selectedIds.size > 0
                    ? `${selectedIds.size} of ${filteredItems.length} selected`
                    : 'Select All'}
                </span>
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="bulk-restore-btn"
                  onClick={handleRestoreBulk}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-900/50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore ({selectedIds.size})</span>
                </button>

                <button
                  type="button"
                  id="bulk-delete-permanently-btn"
                  onClick={promptPermanentDeleteBulk}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Loading recently deleted items...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Trash State */
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery || filterType !== 'all' ? 'No matching deleted items' : 'Trash is Empty'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search terms or filter category.'
                  : 'Board photos, chapters, and study PDFs you delete will stay here for 30 days before permanent deletion.'}
              </p>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Grid of Trashed Items */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isExpiringSoon = item.daysRemaining <= 3;

              return (
                <div
                  key={item.id}
                  id={`trashed-item-${item.id}`}
                  className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all p-4 flex flex-col justify-between shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header & Checkbox */}
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      id={`select-trash-item-${item.id}`}
                      onClick={() => toggleSelect(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    {/* Thumbnail / Icon */}
                    <div className="relative shrink-0">
                      {item.type === 'photo' ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      ) : item.type === 'pdf' ? (
                        <div className="w-14 h-14 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Folder className="w-6 h-6" />
                        </div>
                      )}

                      {/* Type Badge */}
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                        {item.type}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        <span className="truncate">{item.locationPath}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Expiration and Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* 30-Day Expiration Tag */}
                    <div
                      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg ${
                        isExpiringSoon
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>
                        {item.daysRemaining === 0
                          ? 'Purging soon'
                          : `${item.daysRemaining} ${item.daysRemaining === 1 ? 'day' : 'days'} left`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`restore-item-${item.id}`}
                        onClick={() => handleRestoreSingle(item)}
                        disabled={isProcessing}
                        title="Restore item to its original location"
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>

                      <button
                        type="button"
                        id={`perm-delete-item-${item.id}`}
                        onClick={() => promptPermanentDeleteSingle(item)}
                        disabled={isProcessing}
                        title="Delete permanently (cannot be undone)"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Permanent Delete Modal */}
      <PermanentDeleteConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.action}
        title={modalState.title}
        description={modalState.description}
        itemCount={modalState.itemCount}
        isProcessing={isProcessing}
      />
    </div>
  );
};
