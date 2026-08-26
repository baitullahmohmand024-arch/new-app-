/**
 * Easy Study Snap - Gallery Import Modal
 * Phase 7: Multi-Photo Gallery Import & Staging
 * 
 * Allows students to choose multiple board photos from their device,
 * reorder them, remove unwanted selections, and import directly into the active chapter.
 */

import React, { useState, useRef, ChangeEvent } from 'react';
import { Chapter, Subject, AcademicField, BoardPhoto, UserProfile } from '../../types';
import { ImageOptimizer, ProcessedImageData } from '../../utils/imageOptimizer';
import { Button } from '../common/Button';
import {
  X,
  Upload,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
  FolderOpen,
  FileCheck,
} from 'lucide-react';

interface StagedPhotoItem {
  id: string;
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileName: string;
  sizeBytes: number;
}

interface GalleryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  chapter: Chapter;
  subject: Subject;
  field: AcademicField | null;
  existingPhotoCount: number;
  onImportComplete: (importedPhotos: BoardPhoto[]) => void;
}

export const GalleryImportModal: React.FC<GalleryImportModalProps> = ({
  isOpen,
  onClose,
  user,
  chapter,
  subject,
  field,
  existingPhotoCount,
  onImportComplete,
}) => {
  const [stagedPhotos, setStagedPhotos] = useState<StagedPhotoItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file selection from local device / gallery
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setDuplicateWarning(null);

    const newStaged: StagedPhotoItem[] = [...stagedPhotos];
    let duplicatesSkipped = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check if file with same name and size is already staged
        const isDuplicate = newStaged.some(
          (p) => p.fileName === file.name && p.sizeBytes === file.size
        );

        if (isDuplicate) {
          duplicatesSkipped++;
          continue;
        }

        const processed = await ImageOptimizer.processImageFile(file);
        newStaged.push({
          id: `stage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          dataUrl: processed.dataUrl,
          thumbnailUrl: processed.thumbnailUrl,
          width: processed.width,
          height: processed.height,
          fileName: processed.fileName,
          sizeBytes: processed.originalSizeBytes,
        });
      }

      setStagedPhotos(newStaged);

      if (duplicatesSkipped > 0) {
        setDuplicateWarning(
          `${duplicatesSkipped} duplicate image${duplicatesSkipped > 1 ? 's were' : ' was'} detected and skipped to keep notes organized.`
        );
      }
    } catch (err) {
      console.error('Error importing photos', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while reading selected images.'
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper to load sample classroom whiteboard notes for immediate demo testing
  const handleAddSampleNotes = () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setDuplicateWarning(null);

    const sampleTopics = [
      { title: 'Standard Quadratic Equation & Discriminant', num: 1 },
      { title: 'Step-by-Step Worked Example (Factoring & Roots)', num: 2 },
      { title: 'Parabola Curve & Vertex Graphing Properties', num: 3 },
    ];

    const generated: StagedPhotoItem[] = sampleTopics.map((topic) => {
      const sample = ImageOptimizer.generateSampleLectureNote(
        subject.name,
        chapter.title,
        topic.num,
        topic.title
      );
      return {
        id: `sample_${Date.now()}_${topic.num}_${Math.random().toString(36).slice(2, 6)}`,
        dataUrl: sample.dataUrl,
        thumbnailUrl: sample.thumbnailUrl,
        width: sample.width,
        height: sample.height,
        fileName: sample.fileName,
        sizeBytes: sample.originalSizeBytes,
      };
    });

    setStagedPhotos((prev) => [...prev, ...generated]);
    setIsProcessing(false);
  };

  // Reordering staged photos
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...stagedPhotos];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setStagedPhotos(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index < 0 || index >= stagedPhotos.length - 1) return;
    const updated = [...stagedPhotos];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setStagedPhotos(updated);
  };

  // Remove single staged item
  const handleRemoveStaged = (id: string) => {
    setStagedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear all staged items
  const handleClearAll = () => {
    setStagedPhotos([]);
    setErrorMessage(null);
    setDuplicateWarning(null);
  };

  // Final Confirmation: Save to Chapter
  const handleConfirmImport = () => {
    if (stagedPhotos.length === 0) return;

    const baseOrder = existingPhotoCount;
    const importedBoardPhotos: BoardPhoto[] = stagedPhotos.map((item, index) => ({
      id: `photo_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
      userId: user.id,
      chapterId: chapter.id,
      orderIndex: baseOrder + index + 1,
      localDataUrl: item.dataUrl,
      thumbnailUrl: item.thumbnailUrl,
      width: item.width,
      height: item.height,
      rotation: 0,
      filterMode: 'normal',
      syncStatus: 'synced',
      source: 'gallery',
      fileName: item.fileName,
      createdAt: Date.now() + index * 10,
      isDeleted: false,
    }));

    onImportComplete(importedBoardPhotos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-200">
      <div
        id="gallery-import-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-modal-enter"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Upload className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Import from Gallery
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Importing into: <strong>{subject.name}</strong> → <strong>Ch. {chapter.chapterNumber}: {chapter.title}</strong>
            </p>
          </div>

          <button
            type="button"
            id="close-gallery-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Permission & Privacy Notification Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-indigo-950 dark:text-indigo-100">
                Photo Access & Offline Storage Notice
              </p>
              <p className="text-[11px] leading-relaxed text-indigo-800 dark:text-indigo-300">
                Photo access lets you choose existing board notes and save them to this chapter. Your original gallery photos remain untouched in your device. Easy Study Snap creates a private study copy saved offline.
              </p>
            </div>
          </div>

          {/* Hidden Native Multiple File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
            id="gallery-file-input"
          />

          {/* Upload / Selection Action Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Option: Choose Photos from device */}
            <div
              id="trigger-file-select-card"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-indigo-400/60 dark:border-indigo-600/40 hover:border-indigo-600 dark:hover:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 transition-all group"
            >
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Select Multiple Photos
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Browse phone gallery or local computer files
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Tap to Choose Images
              </span>
            </div>

            {/* Secondary Option: Load Sample Whiteboard Notes (For Quick Testing) */}
            <div
              id="load-sample-board-notes-card"
              onClick={handleAddSampleNotes}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer flex flex-col items-center justify-center text-center space-y-2.5 transition-all group"
            >
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Add Sample Board Notes
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Load 3 realistic math whiteboard slides for testing
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                + Load 3 Test Slides
              </span>
            </div>
          </div>

          {/* Duplicate warning notification */}
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Staged Photos Review List */}
          {stagedPhotos.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-500" />
                    Review Selection ({stagedPhotos.length} {stagedPhotos.length === 1 ? 'photo' : 'photos'})
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    • Will be assigned sequence #{existingPhotoCount + 1} to #{existingPhotoCount + stagedPhotos.length}
                  </span>
                </div>

                <button
                  type="button"
                  id="clear-staged-photos-btn"
                  onClick={handleClearAll}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Staged Items List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {stagedPhotos.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    {/* Order Badge */}
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      #{index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{item.width} × {item.height}px</span>
                        <span>•</span>
                        <span>{(item.sizeBytes / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>

                    {/* Order & Remove Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Up in sequence"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === stagedPhotos.length - 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Down in sequence"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Remove item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveStaged(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remove photo from import"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-center space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ImageIcon className="w-6 h-6 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No photographs staged yet
              </p>
              <p className="text-[11px]">
                Click "Select Multiple Photos" or "Add Sample Board Notes" above to begin.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stagedPhotos.length > 0 ? (
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {stagedPhotos.length} {stagedPhotos.length === 1 ? 'Photo' : 'Photos'} ready to import
              </span>
            ) : (
              <span>0 photos selected</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="cancel-gallery-import-btn"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              id="confirm-gallery-import-btn"
              variant="primary"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmImport}
              disabled={stagedPhotos.length === 0 || isProcessing}
            >
              {isProcessing
                ? 'Processing...'
                : `Add ${stagedPhotos.length > 0 ? stagedPhotos.length : ''} to Chapter`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
