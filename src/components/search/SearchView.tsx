import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserProfile,
  AcademicField,
  SearchResultItem,
  SearchResultType,
  RecentOpenedChapter,
  StudyPDF,
  BoardPhoto,
} from '../../types';
import { SearchService } from '../../services/searchService';
import { SearchResultCard } from './SearchResultCard';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Search,
  X,
  Clock,
  Camera,
  FileText,
  Bookmark,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
  SearchX,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface SearchViewProps {
  user: UserProfile | null;
  fields: AcademicField[];
  onNavigateToField: (fieldId: string) => void;
  onNavigateToSubject: (fieldId: string, subjectId: string) => void;
  onNavigateToChapter: (fieldId: string, subjectId: string, chapterId: string) => void;
  onNavigateToPdf: (pdf: StudyPDF) => void;
  onNavigateToAllPdfs: () => void;
  initialQuery?: string;
}

type FilterCategory = 'all' | 'field' | 'subject' | 'chapter' | 'pdf';

export const SearchView: React.FC<SearchViewProps> = ({
  user,
  fields,
  onNavigateToField,
  onNavigateToSubject,
  onNavigateToChapter,
  onNavigateToPdf,
  onNavigateToAllPdfs,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  // Recents state for empty search screen
  const [recentChapters, setRecentChapters] = useState<RecentOpenedChapter[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<
    { photo: BoardPhoto; chapterTitle?: string; subjectName?: string; fieldId?: string }[]
  >([]);
  const [recentPDFs, setRecentPDFs] = useState<StudyPDF[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Load Recents when user changes or query is empty
  useEffect(() => {
    if (!user) return;
    const recents = SearchService.getRecentlyOpenedChapters(user.id, 5);
    setRecentChapters(recents);

    SearchService.getRecentlyCapturedPhotos(user.id, 6).then((photos) => {
      setRecentPhotos(photos);
    });

    SearchService.getRecentPDFs(user.id, 4).then((pdfs) => {
      setRecentPDFs(pdfs);
    });
  }, [user]);

  // Execute Debounced Deterministic Search
  useEffect(() => {
    if (!user) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const contextFilter =
        selectedFieldFilter !== 'all' ? { fieldId: selectedFieldFilter } : undefined;

      const searchResults = await SearchService.search(
        user.id,
        trimmed,
        activeCategory,
        contextFilter
      );
      setResults(searchResults);
      setIsSearching(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [query, activeCategory, selectedFieldFilter, user]);

  // Category result counts for badges
  const categoryCounts = useMemo(() => {
    if (!query.trim() || !user) {
      return { all: 0, field: 0, subject: 0, chapter: 0, pdf: 0 };
    }
    const counts = { all: results.length, field: 0, subject: 0, chapter: 0, pdf: 0 };
    results.forEach((r) => {
      if (counts[r.type] !== undefined) {
        counts[r.type]++;
      }
    });
    return counts;
  }, [results, query, user]);

  // Navigation router for a search result card
  const handleResultClick = (item: SearchResultItem) => {
    if (item.type === 'field') {
      onNavigateToField(item.fieldId);
    } else if (item.type === 'subject' && item.subjectId) {
      onNavigateToSubject(item.fieldId, item.subjectId);
    } else if (item.type === 'chapter' && item.subjectId && item.chapterId) {
      onNavigateToChapter(item.fieldId, item.subjectId, item.chapterId);
    } else if (item.type === 'pdf') {
      // Find full PDF or navigate to PDF tab
      onNavigateToAllPdfs();
    }
  };

  const handleSuggestionClick = (suggested: string) => {
    setQuery(suggested);
    searchInputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    searchInputRef.current?.focus();
  };

  const filterTabs: { id: FilterCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'chapter', label: 'Chapters', icon: Bookmark },
    { id: 'pdf', label: 'PDFs', icon: FileText },
    { id: 'subject', label: 'Subjects', icon: BookOpen },
    { id: 'field', label: 'Fields', icon: GraduationCap },
  ];

  const suggestedQueries = [
    'Quadratic Equations',
    'Matrices',
    'Mathematics',
    'Physics',
    'Chapter 1',
    'Chemistry',
    'Notes',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Main Search Header & Input Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Global Study Search
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Instantly find fields, subjects, chapters, and study PDFs across your notebook
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search
              className={`w-5 h-5 transition-colors ${
                isSearching
                  ? 'text-indigo-600 dark:text-indigo-400 animate-pulse'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
          </div>

          <input
            ref={searchInputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') clearSearch();
            }}
            placeholder="Search study material (e.g. Quadratic, Physics, Chapter 1, Notes...)"
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base font-medium shadow-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-600/10 transition-all"
          />

          {query && (
            <button
              id="btn-clear-search"
              type="button"
              onClick={clearSearch}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>

        {/* 2. Filter Tabs & Context Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              const count = categoryCounts[tab.id];

              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {query.trim() && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Academic Field Track Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <select
              id="field-context-filter"
              value={selectedFieldFilter}
              onChange={(e) => setSelectedFieldFilter(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tracks</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Search Results State */}
      {query.trim() ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
            <span>
              Found {results.length} {results.length === 1 ? 'matching item' : 'matching items'} for &ldquo;
              {query.trim()}&rdquo;
            </span>
            {selectedFieldFilter !== 'all' && (
              <span className="text-indigo-600 dark:text-indigo-400">
                Filtered by {fields.find((f) => f.id === selectedFieldFilter)?.name}
              </span>
            )}
          </div>

          {results.length > 0 ? (
            <div className="space-y-2.5">
              {results.map((item) => (
                <SearchResultCard
                  key={item.id}
                  item={item}
                  onClick={() => handleResultClick(item)}
                />
              ))}
            </div>
          ) : (
            /* No Results Empty State */
            <div
              id="search-no-results"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No results found for &ldquo;{query.trim()}&rdquo;
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Try searching by subject, chapter, or PDF name. Check your spelling or try broader terms.
                </p>
              </div>

              {/* Suggestions Chips */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Suggested Searches:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {suggestedQueries.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 4. Empty Query State: Recents & Quick Suggestions */
        <div className="space-y-6">
          {/* Quick Search Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQueries.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSuggestionClick(sug)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Recently Opened Chapters */}
          {recentChapters.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Recently Opened Chapters
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recentChapters.map((recent) => (
                  <button
                    key={`recent-chap-${recent.chapterId}`}
                    id={`recent-chap-${recent.chapterId}`}
                    type="button"
                    onClick={() =>
                      onNavigateToChapter(recent.fieldId, recent.subjectId, recent.chapterId)
                    }
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all group flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {recent.subjectName}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Ch {recent.chapterNumber}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {recent.chapterTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {recent.fieldName} • {recent.photoCount} board photos
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Recently Captured Board Photos */}
          {recentPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Recently Captured Photos
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {recentPhotos.map((item) => (
                  <button
                    key={`recent-photo-${item.photo.id}`}
                    type="button"
                    onClick={() => {
                      if (item.fieldId) {
                        // Navigate to the chapter
                        onNavigateToChapter(
                          item.fieldId,
                          '', // Subject will be auto-resolved in App.tsx
                          item.photo.chapterId
                        );
                      }
                    }}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-indigo-500 transition-all text-left"
                  >
                    <img
                      src={item.photo.thumbnailUrl || item.photo.localDataUrl}
                      alt={item.chapterTitle || 'Board Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <p className="text-[10px] text-white font-medium truncate leading-tight">
                        {item.chapterTitle || 'View Chapter'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Recent Study PDFs */}
          {recentPDFs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Recent Study PDFs
                </label>
                <button
                  type="button"
                  onClick={onNavigateToAllPdfs}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View all in Library <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recentPDFs.map((pdf) => (
                  <button
                    key={`recent-pdf-${pdf.id}`}
                    type="button"
                    onClick={() => onNavigateToPdf(pdf)}
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {pdf.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {pdf.subjectName} • {pdf.pageCount} Pages • {pdf.photoCount} Photos
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
