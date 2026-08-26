import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
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
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Privacy Policy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Easy Study Snap • Effective August 2026
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

          {/* Policy Document Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed">
            {/* 1. Introduction */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">1</span>
                Introduction
              </h4>
              <p>
                Easy Study Snap ("we", "our", or "the application") is committed to protecting student privacy. This Privacy Policy describes how information is collected, used, stored, and protected when you use Easy Study Snap on mobile and web devices.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">2</span>
                Information We Collect
              </h4>
              <p>We collect only the minimum information necessary to organize and preserve your classroom study material:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Google account authentication profile (name, email address, avatar photo if provided).</li>
                <li>Student profile information: name, father's name, grade/class, optional roll number, and selected academic field.</li>
                <li>Study hierarchy data: academic fields, subjects, chapters, board photos, and generated study PDFs.</li>
                <li>Application preferences: dark/light theme mode, backup & sync status.</li>
              </ul>
            </section>

            {/* 3. Google Account Information */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">3</span>
                Google Account Information
              </h4>
              <p>
                When you sign in using Google Sign-In, the official Google OAuth mechanism authenticates your account and provides standard basic profile information (display name, email, avatar).
              </p>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs">
                <strong>Password Protection:</strong> Easy Study Snap NEVER requests, accesses, receives, or stores your Google password. Authentication is processed directly through Google's secure authentication service.
              </div>
            </section>

            {/* 4. Student Profile Information */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">4</span>
                Student Profile Information
              </h4>
              <p>
                Student details (such as Grade, Father's Name, and Roll Number) are optional and editable at any time in the Profile section. This information is used strictly to label study notes, PDF covers, and personalize the AI Academic Teacher.
              </p>
            </section>

            {/* 5. Board Photos and Study Material */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">5</span>
                Board Photos and Study Material
              </h4>
              <p>
                Board photographs taken in class or imported from your gallery represent private student study material. They are used exclusively within your account to organize notes, compile PDF study chapters, and power study assistance. Board photos are never made publicly visible.
              </p>
            </section>

            {/* 6. PDFs and Generated Study Files */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">6</span>
                PDFs and Generated Study Files
              </h4>
              <p>
                Study PDFs are generated on-device using client-side formatting. They reside in your local browser/device database and can be saved to your device or shared via your operating system's native share sheet.
              </p>
            </section>

            {/* 7. Cloud Backup and Synchronization */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">7</span>
                Cloud Backup and Synchronization
              </h4>
              <p>
                Easy Study Snap uses Firebase Cloud Firestore and Firebase Storage for cloud synchronization and multi-device access. Data is NOT automatically stored in personal Gmail inboxes. Cloud synchronization occurs over encrypted channels to back up your subject hierarchy and study progress.
              </p>
            </section>

            {/* 8. Device Permissions */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">8</span>
                Device Permissions
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Camera:</strong> Requested only when you tap the Camera to capture classroom board notes.</li>
                <li><strong>Photo Gallery:</strong> Requested only when you intentionally choose to import existing images from your gallery.</li>
                <li><strong>Storage:</strong> Used by your browser to store offline notes in IndexedDB and download generated PDFs.</li>
              </ul>
            </section>

            {/* 9. How Information Is Used */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">9</span>
                How Information Is Used
              </h4>
              <p>
                We use collected information solely to provide core study features: cataloging photos into subjects/chapters, generating study PDFs, backing up data, and answering academic questions through the AI Teacher.
              </p>
            </section>

            {/* 10. How Information Is Stored */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">10</span>
                How Information Is Stored
              </h4>
              <p>
                Your data is stored offline-first in your device's sandboxed IndexedDB database for instant high-speed access without an active internet connection. When online, state is synced with secure cloud database records.
              </p>
            </section>

            {/* 11. Security */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">11</span>
                Security
              </h4>
              <p>
                We implement industry-standard technical measures including HTTPS/TLS encryption in transit, strict user ID data scoping, and backend server proxying for AI features to ensure secrets, API keys, and sensitive tokens are never exposed to the client.
              </p>
            </section>

            {/* 12. Data Sharing */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">12</span>
                Data Sharing
              </h4>
              <p>
                Easy Study Snap does not sell, rent, monetize, or share your personal data with third-party advertisers or data brokers. Data is only shared when you explicitly choose to share an exported PDF file with external apps or classmates.
              </p>
            </section>

            {/* 13. Third-Party Services */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">13</span>
                Third-Party Services
              </h4>
              <p>
                We rely on reputable infrastructure providers: Google Firebase (Authentication & Firestore cloud database) and Google Gemini (Academic Teacher assistance via secure server proxy).
              </p>
            </section>

            {/* 14. Account Deletion */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">14</span>
                Account Deletion
              </h4>
              <p>
                You can delete your account at any time directly in the Settings/Profile screen. Deleting your account immediately erases your local student profile, all scoped subjects, chapters, board photos, PDFs, and clears cloud synchronization records.
              </p>
            </section>

            {/* 15. Data Deletion */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">15</span>
                Data Deletion
              </h4>
              <p>
                Students maintain granular control to delete individual photos, chapters, or subjects. Items deleted move to the Trash & Recovery section.
              </p>
            </section>

            {/* 16. Recently Deleted / Trash */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">16</span>
                Recently Deleted / Trash
              </h4>
              <p>
                Deleted items are retained in the Trash for up to 30 days to prevent accidental loss. You may restore items at any time during this window. After 30 days, expired items are automatically and permanently purged.
              </p>
            </section>

            {/* 17. Children's Privacy */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">17</span>
                Children's Privacy
              </h4>
              <p>
                Easy Study Snap is designed for educational use by students. We do not knowingly collect personal information beyond basic academic study data. For younger students under 13, parental or educational institution supervision is recommended.
              </p>
            </section>

            {/* 18. Data Retention */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">18</span>
                Data Retention
              </h4>
              <p>
                Study material is retained for as long as your account remains active or until you choose to delete individual items or your entire profile.
              </p>
            </section>

            {/* 19. Changes to This Privacy Policy */}
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">19</span>
                Changes to This Privacy Policy
              </h4>
              <p>
                We may update this policy occasionally as new features are added. Any updates will be reflected with a revised effective date within the application settings.
              </p>
            </section>

            {/* 20. Contact Information */}
            <section className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center">20</span>
                Contact Information
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                If you have questions about this Privacy Policy or data handling in Easy Study Snap:
              </p>
              <div className="mt-2 space-y-1 text-slate-800 dark:text-slate-200 font-medium">
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
