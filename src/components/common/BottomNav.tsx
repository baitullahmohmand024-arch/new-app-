import React from 'react';
import { BookOpen, Search, FileText, User, GraduationCap } from 'lucide-react';
import { NavigationTab } from '../../types';

interface BottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'study' as NavigationTab,
      label: 'Home',
      icon: BookOpen,
    },
    {
      id: 'teacher' as NavigationTab,
      label: 'AI Teacher',
      icon: GraduationCap,
    },
    {
      id: 'pdfs' as NavigationTab,
      label: 'My PDFs',
      icon: FileText,
    },
    {
      id: 'search' as NavigationTab,
      label: 'Search',
      icon: Search,
    },
    {
      id: 'profile' as NavigationTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-lg"
    >
      <div className="max-w-lg mx-auto px-2 sm:px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-4 rounded-xl transition-all duration-200 relative cursor-pointer active:scale-95 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/90 dark:bg-[#1a2647] font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-[#131d36]/60 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`} />
                {tab.id === 'teacher' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse ring-2 ring-white dark:ring-[#0a0f1d]" />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight select-none transition-opacity duration-200 whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


