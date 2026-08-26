import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { X, Plus, FolderPlus, AlertCircle } from 'lucide-react';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, chapterNumber: number) => void;
  nextChapterNumber: number;
  subjectName: string;
  existingChapterTitles?: string[];
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextChapterNumber,
  subjectName,
  existingChapterTitles = [],
}) => {
  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(nextChapterNumber);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setChapterNumber(nextChapterNumber);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    // 1. Validation: Non-empty
    if (!cleanTitle) {
      setError('Please enter a chapter name.');
      return;
    }

    // 2. Validation: Length limit
    if (cleanTitle.length > 80) {
      setError('Chapter name must be under 80 characters.');
      return;
    }

    // 3. Validation: Duplicate warning check
    const isDuplicate = existingChapterTitles.some(
      (t) => t.toLowerCase() === cleanTitle.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A chapter named "${cleanTitle}" already exists in ${subjectName}.`);
      return;
    }

    onAdd(cleanTitle, Number(chapterNumber) || nextChapterNumber);
    handleClose();
  };

  return (
    <div
      id="add-chapter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
    >
      <div className="w-full max-w-md animate-modal-enter">
        <Card
          id="add-chapter-modal-content"
          className="shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create Chapter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adding to {subjectName}
                </p>
              </div>
            </div>
            <button
              id="close-add-chapter-modal-btn"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {/* Chapter Number Input */}
              <div className="col-span-1">
                <label
                  htmlFor="chapter-number-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Ch. #
                </label>
                <input
                  id="chapter-number-input"
                  type="number"
                  min="1"
                  max="999"
                  value={chapterNumber}
                  onChange={(e) => {
                    setChapterNumber(Number(e.target.value));
                    if (error) setError(null);
                  }}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                />
              </div>

              {/* Chapter Title Input */}
              <div className="col-span-3">
                <label
                  htmlFor="chapter-title-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Chapter Name
                </label>
                <input
                  id="chapter-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Quadratic Equations, Trigonometry"
                  maxLength={80}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Board photographs and future PDFs will automatically be linked to this chapter.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                id="cancel-add-chapter-btn"
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                id="submit-add-chapter-btn"
                type="submit"
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                disabled={!title.trim()}
              >
                Create Chapter
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
