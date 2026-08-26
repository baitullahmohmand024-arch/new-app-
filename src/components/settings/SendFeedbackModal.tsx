import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquarePlus,
  X,
  Bug,
  Lightbulb,
  MessageSquare,
  MoreHorizontal,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface SendFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

type FeedbackType = 'Bug Report' | 'Feature Suggestion' | 'General Feedback' | 'Other';

export const SendFeedbackModal: React.FC<SendFeedbackModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const [selectedType, setSelectedType] = useState<FeedbackType>('Feature Suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories: { type: FeedbackType; icon: React.ReactNode; label: string }[] = [
    { type: 'Bug Report', icon: <Bug className="w-4 h-4" />, label: 'Bug Report' },
    { type: 'Feature Suggestion', icon: <Lightbulb className="w-4 h-4" />, label: 'Feature Suggestion' },
    { type: 'General Feedback', icon: <MessageSquare className="w-4 h-4" />, label: 'General Feedback' },
    { type: 'Other', icon: <MoreHorizontal className="w-4 h-4" />, label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);

    const DEVELOPER_EMAIL = 'baitullahmohmand024@gmail.com';
    const subject = encodeURIComponent(`[${selectedType}] Easy Study Snap Feedback`);
    const body = encodeURIComponent(`Feedback Type: ${selectedType}
From User: ${userEmail || 'Student'}

Feedback Details:
${feedbackText.trim()}

Sent from Easy Study Snap App.`);

    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFeedbackText('');
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Send Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help us improve Easy Study Snap.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          {isSubmitted ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Your input directly helps us make Easy Study Snap better for all students.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Feedback Category Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Feedback Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(({ type, icon, label }) => {
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                          {icon}
                        </span>
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tell us what you think...
                </label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Describe your suggestion, bug details, or experience here..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!feedbackText.trim() || isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
