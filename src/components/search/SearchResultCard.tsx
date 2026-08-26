import React from 'react';
import { SearchResultItem } from '../../types';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  FileText,
  ChevronRight,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface SearchResultCardProps {
  item: SearchResultItem;
  onClick: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ item, onClick }) => {
  const getTypeBadge = () => {
    switch (item.type) {
      case 'field':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <GraduationCap className="w-3 h-3" /> Field
          </span>
        );
      case 'subject':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <BookOpen className="w-3 h-3" /> Subject
          </span>
        );
      case 'chapter':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <Bookmark className="w-3 h-3" /> Chapter
          </span>
        );
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <FileText className="w-3 h-3" /> PDF Notes
          </span>
        );
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'field':
        return <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'subject':
        return <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'chapter':
        return <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <button
      id={`search-result-${item.id}`}
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Type Icon Container */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          {getTypeIcon()}
        </div>

        {/* Content Hierarchy */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getTypeBadge()}
            {item.isCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-2.5 h-2.5" /> Completed
              </span>
            )}
            {typeof item.photoCount === 'number' && item.photoCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Camera className="w-3 h-3" /> {item.photoCount} photos
              </span>
            )}
            {typeof item.pdfPageCount === 'number' && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                • {item.pdfPageCount} {item.pdfPageCount === 1 ? 'page' : 'pages'}
              </span>
            )}
          </div>

          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h4>

          {/* Breadcrumb Location Path */}
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
            <span className="text-slate-400 dark:text-slate-500">In</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.locationPath}</span>
          </p>
        </div>
      </div>

      {/* Action Chevron */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition-all shrink-0">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
};
