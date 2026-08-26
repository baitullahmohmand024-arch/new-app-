import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  MessageCircle,
  Mail,
  X,
  Sparkles,
  BookOpen,
  Camera,
  FolderTree,
} from 'lucide-react';
import developerPhoto from '../../assets/images/developer_portrait_1787673845615.jpg';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const DEVELOPER_PHONE = '03439406862';
  const DEVELOPER_EMAIL = 'baitullahmohmand024@gmail.com';
  const WHATSAPP_INTL = '923439406862';

  const handleOpenWhatsApp = () => {
    const defaultText = encodeURIComponent('Hello Bait Ullah, I need help with Easy Study Snap.');
    const whatsappUrl = `https://wa.me/${WHATSAPP_INTL}?text=${defaultText}`;
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
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
    window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
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
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              About Developer
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 flex flex-col items-center text-center">
            {/* Developer Portrait Image with subtle elevation & border */}
            <div className="relative mb-4">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={developerPhoto}
                  alt="Bait ullah son of Mustaqeem Khan"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            {/* Developer Name & Title */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              Bait ullah son of Mustaqeem Khan
            </h2>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              Easy Study Snap — Developer / Creator
            </p>

            {/* Location */}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>District Mohmand, Pandiali</span>
            </div>

            {/* Purpose & Description */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                "Easy Study Snap was created to make it easier for students to capture, organize, preserve, and study their classroom board notes without the frustration of searching through a crowded phone gallery."
              </p>
            </div>

            {/* Core Capabilities */}
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center">
                <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Capture</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center">
                <FolderTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Organize</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex flex-col items-center">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Study</span>
              </div>
            </div>

            {/* Developer Contact Buttons */}
            <div className="mt-5 w-full space-y-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: {DEVELOPER_PHONE}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenEmail}
                className="w-full h-11 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Email: {DEVELOPER_EMAIL}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
