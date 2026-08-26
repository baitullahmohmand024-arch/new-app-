import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  Mail,
  MessageSquarePlus,
  X,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface ContactHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSendFeedback: () => void;
}

export const ContactHelpModal: React.FC<ContactHelpModalProps> = ({
  isOpen,
  onClose,
  onOpenSendFeedback,
}) => {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const DEVELOPER_PHONE = '03439406862';
  const DEVELOPER_EMAIL = 'baitullahmohmand024@gmail.com';
  const WHATSAPP_INTL = '923439406862'; // Pakistan country code + number without leading 0

  const handleOpenWhatsApp = () => {
    const defaultText = encodeURIComponent('Hello Bait Ullah, I need help with Easy Study Snap.');
    const whatsappUrl = `https://wa.me/${WHATSAPP_INTL}?text=${defaultText}`;
    
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      // Fallback
      window.location.href = whatsappUrl;
    }
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent('Easy Study Snap — Help & Feedback');
    const body = encodeURIComponent(`Hello Bait Ullah,

I need help with Easy Study Snap.

My issue/feedback is:
[Type your message here]

Thank you.`);

    const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

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
          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Help & Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  We're here to help you get the most from Easy Study Snap.
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

          {/* Modal Body */}
          <div className="p-6 space-y-3.5">
            {/* Option 1: WhatsApp */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 active:scale-[0.99] transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    Contact on WhatsApp
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fast direct chat ({DEVELOPER_PHONE})
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 2: Email */}
            <button
              type="button"
              onClick={handleOpenEmail}
              className="w-full p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100/70 dark:hover:bg-blue-950/50 active:scale-[0.99] transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Contact by Email
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {DEVELOPER_EMAIL}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Option 3: In-App Feedback Form */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSendFeedback();
              }}
              className="w-full p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50 active:scale-[0.99] transition-all flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    Send Feedback
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Suggestions, bug reports, and ideas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Developer: Bait Ullah
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
