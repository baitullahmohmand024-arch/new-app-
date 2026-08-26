import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  ExternalLink,
  Printer,
  FileText,
  Check,
  AlertCircle,
  Clock,
  HardDrive,
  BookOpen,
} from 'lucide-react';
import { StudyPDF } from '../../types';

interface PdfViewerModalProps {
  pdf: StudyPDF | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRequested?: (pdf: StudyPDF) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  pdf,
  isOpen,
  onClose,
  onUpdateRequested,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  if (!isOpen || !pdf) return null;

  // Prefer dataUrl or localBlobUrl
  const fileUrl = pdf.pdfDataUrl || pdf.localBlobUrl || '';

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = pdf.fileName || `${pdf.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // Try file sharing if blob is available
        if (pdf.pdfDataUrl) {
          const res = await fetch(pdf.pdfDataUrl);
          const blob = await res.blob();
          const file = new File([blob], pdf.fileName || 'study_notes.pdf', { type: 'application/pdf' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: pdf.title,
              text: `Study Notes: ${pdf.title} (${pdf.subjectName}) created with Easy Study Snap.`,
            });
            setShareStatus('Shared successfully');
            setTimeout(() => setShareStatus(null), 3000);
            return;
          }
        }

        // Fallback to text share
        await navigator.share({
          title: pdf.title,
          text: `Study Notes: ${pdf.title} (${pdf.subjectName}) created with Easy Study Snap.`,
        });
        setShareStatus('Shared successfully');
        setTimeout(() => setShareStatus(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error', err);
        }
      }
    } else {
      // Fallback: copy file info
      handleDownload();
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open(fileUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    } catch (e) {
      console.error('Print window error', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[94vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {pdf.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{pdf.subjectName}</span>
                <span>•</span>
                <span>{pdf.pageCount} Pages</span>
                <span>•</span>
                <span>{formatBytes(pdf.fileSizeBytes)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onUpdateRequested && (
              <button
                type="button"
                onClick={() => onUpdateRequested(pdf)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                title="Re-create or update this PDF with latest photos"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Update PDF
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
              title="Download PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Share PDF"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{copied ? 'Downloaded' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              title="Open in new window / Print"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Status Toast */}
        {shareStatus && (
          <div className="bg-emerald-500 text-white text-xs py-1.5 px-4 text-center font-medium">
            {shareStatus}
          </div>
        )}

        {/* PDF Frame Viewer */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 relative overflow-hidden flex flex-col">
          {fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              title={pdf.title}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">Unable to preview PDF document directly</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Please tap download below to view the PDF file with your device's native PDF reader.
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download {pdf.fileName}
              </button>
            </div>
          )}
        </div>

        {/* Footer Info Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Compiled: {new Date(pdf.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              {pdf.photoCount || (pdf.pageCount - 1)} Board Photos
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {pdf.creatorName} • Easy Study Snap
          </div>
        </div>
      </div>
    </div>
  );
};
