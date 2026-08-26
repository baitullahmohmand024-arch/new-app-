import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  Camera,
  FolderTree,
  BookOpen,
  FileText,
  ShieldCheck,
  X,
  Layers,
} from 'lucide-react';
import { APP_LOGO_URL } from '../../utils/branding';

interface AboutAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeveloper?: () => void;
}

export const AboutAppModal: React.FC<AboutAppModalProps> = ({
  isOpen,
  onClose,
  onOpenDeveloper,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              About Easy Study Snap
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center text-center">
            {/* App Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-600/20 flex items-center justify-center p-4 mb-3.5">
              <img
                src={APP_LOGO_URL}
                alt="Easy Study Snap Logo"
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Easy Study Snap
            </h2>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Version 1.0.0
            </div>

            {/* Core Purpose Description */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                "Easy Study Snap helps students capture classroom board photos and organize them by field, subject, and chapter so their study material is easier to find and revisit."
              </p>
            </div>

            {/* Core Pillars */}
            <div className="mt-4 w-full space-y-2.5 text-left">
              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">1. Capture</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    High-clarity board photo capture with built-in crop, rotate, and enhance tools.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">2. Organize</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Structured hierarchy by Academic Field (Pre-Med, Engineering, CS, Arts) & Subjects.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">3. Study</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    One-tap PDF book generation, interactive AI Academic Teacher, and practice questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-5 w-full flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {onOpenDeveloper && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeveloper();
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Meet the Developer →
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="ml-auto px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
