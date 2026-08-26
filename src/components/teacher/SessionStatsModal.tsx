import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { AITeacherSessionStats } from '../../types';

interface SessionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AITeacherSessionStats;
  onStrengthenWeakAreas?: () => void;
}

export const SessionStatsModal: React.FC<SessionStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onStrengthenWeakAreas,
}) => {
  if (!isOpen) return null;

  const total = stats.questionsAttempted || 0;
  const correct = stats.correctCount || 0;
  const incorrect = stats.incorrectCount || 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Study Session Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance breakdown and mastery progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#131d36] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131d36] border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mb-0.5">
                Attempted
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {total}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-[#0c2a21]/60 border border-emerald-200/70 dark:border-emerald-800/60 text-center">
              <div className="text-emerald-700 dark:text-emerald-300 text-[11px] font-medium mb-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Correct
              </div>
              <div className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200">
                {correct}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/60 text-center">
              <div className="text-indigo-700 dark:text-indigo-300 text-[11px] font-medium mb-0.5 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Accuracy
              </div>
              <div className="text-lg sm:text-xl font-bold text-indigo-800 dark:text-indigo-200">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Topics Practiced */}
          {stats.topicsPracticed && stats.topicsPracticed.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Topics Covered This Session
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {stats.topicsPracticed.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Identified Weak Concepts */}
          {stats.weakConcepts && stats.weakConcepts.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-[#2c220c]/60 border border-amber-200/80 dark:border-amber-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  Target Areas For Revision
                </h5>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {stats.weakConcepts.length} concept(s) flagged
                </span>
              </div>
              <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200 list-disc list-inside">
                {stats.weakConcepts.map((wc, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {wc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Mistakes Review */}
          {stats.mistakes && stats.mistakes.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                Mistakes Review & Key Rules
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stats.mistakes.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#131d36] border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {m.question}
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Chose: Opt {m.chosen}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Correct: Opt {m.correct}
                      </span>
                    </div>
                    {m.keyIdea && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Rule: </span>
                        {m.keyIdea}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0a0f1d]/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Close
          </button>

          {onStrengthenWeakAreas && stats.weakConcepts && stats.weakConcepts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStrengthenWeakAreas();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Strengthen Weak Areas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
