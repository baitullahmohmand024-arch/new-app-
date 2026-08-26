import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Circle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Loader2,
  Layers,
  BookOpen,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { BoardPhoto, Chapter, Subject, AcademicField, UserProfile, StudyPDF } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { PDFStorageService } from '../../services/pdfStorage';
import { StorageService } from '../../services/storage';

interface CreatePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pdf: StudyPDF) => void;
  user: UserProfile;
  chapter: Chapter;
  subject: Subject;
  field: AcademicField | null;
  initialPhotos: BoardPhoto[];
  existingPdf?: StudyPDF | null;
}

export const CreatePdfModal: React.FC<CreatePdfModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  chapter,
  subject,
  field,
  initialPhotos,
  existingPdf,
}) => {
  const [pdfTitle, setPdfTitle] = useState('');
  const [orderedPhotos, setOrderedPhotos] = useState<BoardPhoto[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [totalProgressSteps, setTotalProgressSteps] = useState(1);
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Default title to chapter title (or subject + chapter)
      setPdfTitle(existingPdf?.title || chapter.title);
      // Sort initial photos by orderIndex / createdAt
      const sorted = [...initialPhotos].sort(
        (a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.createdAt - b.createdAt
      );
      setOrderedPhotos(sorted);
      // Select all photos by default
      setSelectedPhotoIds(new Set(sorted.map((p) => p.id)));
      setIsGenerating(false);
      setErrorMessage(null);
    }
  }, [isOpen, chapter, initialPhotos, existingPdf]);

  if (!isOpen) return null;

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPhotoIds(new Set(orderedPhotos.map((p) => p.id)));
  };

  const deselectAll = () => {
    setSelectedPhotoIds(new Set());
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedPhotos.length) return;

    const newOrder = [...orderedPhotos];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setOrderedPhotos(newOrder);
  };

  const activePhotosToInclude = orderedPhotos.filter((p) => selectedPhotoIds.has(p.id));
  const estimatedPages = (includeCoverPage ? 1 : 0) + activePhotosToInclude.length;

  const handleGenerate = async () => {
    if (!pdfTitle.trim()) {
      setErrorMessage('Please enter a title for your Study PDF.');
      return;
    }

    if (activePhotosToInclude.length === 0) {
      setErrorMessage('Please select at least 1 board photo to include in the PDF.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await PDFGeneratorService.generateStudyPDF({
        title: pdfTitle.trim(),
        user,
        chapter,
        subject,
        field,
        photos: activePhotosToInclude,
        includeCoverPage,
        onProgress: (current, total, msg) => {
          setProgressStep(current);
          setTotalProgressSteps(total);
          setProgressMessage(msg);
        },
      });

      // Save to offline storage
      await PDFStorageService.savePDF(result.pdf);

      // Update chapter flag
      StorageService.updateChapter(user.id, chapter.id, {
        pdfGenerated: true,
      });

      setIsGenerating(false);
      onSuccess(result.pdf);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setIsGenerating(false);
      setErrorMessage(err?.message || 'Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {existingPdf ? 'Re-create / Update Study PDF' : 'Create Study PDF'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subject.name} • Chapter {chapter.chapterNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Document Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              PDF Document Title
            </label>
            <input
              type="text"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. Quadratic Equations & Formula"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-medium"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Will be saved as <span className="font-mono text-slate-700 dark:text-slate-300">{pdfTitle.replace(/\s+/g, '_') || 'document'}.pdf</span>
            </p>
          </div>

          {/* Document Options */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Academic Cover Page</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Includes Chapter title, subject name, track, and "Created by {user.name || 'Student'}"
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeCoverPage}
                onChange={(e) => setIncludeCoverPage(e.target.checked)}
                disabled={isGenerating}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Photo Selection & Order Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Review & Order Photos ({activePhotosToInclude.length}/{orderedPhotos.length} selected)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={isGenerating}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  disabled={isGenerating}
                  className="text-xs text-slate-500 hover:underline font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Photos List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {orderedPhotos.map((photo, index) => {
                const isSelected = selectedPhotoIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-60'
                    }`}
                  >
                    {/* Toggle Selection */}
                    <button
                      type="button"
                      onClick={() => toggleSelectPhoto(photo.id)}
                      disabled={isGenerating}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                      )}

                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={photo.thumbnailUrl || photo.localDataUrl}
                          alt="Board thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          Board Snapshot #{index + 1}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {photo.filterMode && photo.filterMode !== 'normal' && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] uppercase">
                              {photo.filterMode.replace('_', ' ')}
                            </span>
                          )}
                        </p>
                      </div>
                    </button>

                    {/* Order Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'up')}
                        disabled={index === 0 || isGenerating}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(index, 'down')}
                        disabled={index === orderedPhotos.length - 1 || isGenerating}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note on Photo Safety */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              Unchecking photos here will omit them from this PDF without deleting original photos.
            </p>
          </div>

          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  {progressMessage || 'Compiling Study PDF...'}
                </span>
                <span>
                  {progressStep}/{totalProgressSteps}
                </span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(5, (progressStep / totalProgressSteps) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{estimatedPages} total pages</span> (A4 standard)
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || activePhotosToInclude.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
