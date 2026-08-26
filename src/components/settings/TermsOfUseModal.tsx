import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, CheckCircle2, BookOpen } from 'lucide-react';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({
  isOpen,
  onClose,
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
          className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Terms of Use
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Easy Study Snap • Educational Platform Terms
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

          {/* Document Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed">
            {/* 1. Acceptance of Terms */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">1</span>
                Acceptance of Terms
              </h4>
              <p>
                By creating an account or using Easy Study Snap, you agree to these Terms of Use. If you do not agree, please do not use the application.
              </p>
            </section>

            {/* 2. Using Easy Study Snap */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">2</span>
                Using Easy Study Snap
              </h4>
              <p>
                Easy Study Snap is designed to assist students in organizing classroom board photos, generating study PDFs, and revising academic topics. You may use the service for personal, non-commercial educational purposes.
              </p>
            </section>

            {/* 3. Student Content */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">3</span>
                Student Content
              </h4>
              <p>
                You retain ownership of the photos and materials you capture or import. You are responsible for ensuring that you have permission to photograph classroom boards in your school or educational institution.
              </p>
            </section>

            {/* 4. Account Responsibility */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">4</span>
                Account Responsibility
              </h4>
              <p>
                You are responsible for maintaining the security of your Google account and device. Easy Study Snap is not responsible for unauthorized access resulting from shared devices without proper screen locks.
              </p>
            </section>

            {/* 5. PDF Sharing */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">5</span>
                PDF Sharing
              </h4>
              <p>
                When exporting or sharing generated study PDFs, you choose the recipient and platform. Easy Study Snap does not monitor or control files once they are exported from the application.
              </p>
            </section>

            {/* 6. Acceptable Use */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">6</span>
                Acceptable Use
              </h4>
              <p>
                You agree not to use the app to upload malicious software, violate school regulations, or attempt to disrupt the application's synchronization or backend services.
              </p>
            </section>

            {/* 7. Service Availability */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">7</span>
                Service Availability
              </h4>
              <p>
                Easy Study Snap provides offline-first functionality so you can study without an internet connection. While cloud backup is designed for high reliability, students are encouraged to periodically export study PDFs to their device storage.
              </p>
            </section>

            {/* 8. Intellectual Property */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">8</span>
                Intellectual Property
              </h4>
              <p>
                The Easy Study Snap brand, interface design, logo, and source code are the intellectual property of developer Bait ullah.
              </p>
            </section>

            {/* 9. Account Termination */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">9</span>
                Account Termination
              </h4>
              <p>
                You may stop using the app and delete your account and data at any time via the Settings menu.
              </p>
            </section>

            {/* 10. Changes to the Service */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">10</span>
                Changes to the Service
              </h4>
              <p>
                We may improve or modify features over time to enhance student learning and productivity.
              </p>
            </section>

            {/* 11. Contact Information */}
            <section className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center">11</span>
                Contact Information
              </h4>
              <div className="text-slate-800 dark:text-slate-200 font-medium">
                <div><strong>Developer:</strong> Bait ullah son of Mustaqeem Khan</div>
                <div><strong>Location:</strong> District Mohmand, Pandiali</div>
                <div><strong>Email:</strong> baitullahmohmand024@gmail.com</div>
                <div><strong>WhatsApp:</strong> 03439406862</div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
