import React, { useState, useEffect } from 'react';
import { Chapter } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { X, Save, Edit3, AlertCircle } from 'lucide-react';

interface EditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onSave: (chapterId: string, title: string, chapterNumber: number) => void;
  existingChapterTitles?: string[];
}

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  isOpen,
  onClose,
  chapter,
  onSave,
  existingChapterTitles = [],
}) => {
  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setChapterNumber(chapter.chapterNumber);
      setError(null);
    }
  }, [chapter]);

  if (!isOpen || !chapter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError('Chapter name cannot be empty.');
      return;
    }

    if (cleanTitle.length > 80) {
      setError('Chapter name must be under 80 characters.');
      return;
    }

    // Duplicate check excluding current chapter
    const isDuplicate = existingChapterTitles.some(
      (t) =>
        t.toLowerCase() === cleanTitle.toLowerCase() &&
        t.toLowerCase() !== chapter.title.toLowerCase()
    );
    if (isDuplicate) {
      setError(`Another chapter is already named "${cleanTitle}".`);
      return;
    }

    onSave(chapter.id, cleanTitle, Number(chapterNumber) || chapter.chapterNumber);
    onClose();
  };

  return (
    <div
      id="edit-chapter-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md">
        <Card
          id="edit-chapter-modal-content"
          className="shadow-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Rename Chapter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update title or sequence number
                </p>
              </div>
            </div>
            <button
              id="close-edit-chapter-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label
                  htmlFor="edit-chapter-number-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Ch. #
                </label>
                <input
                  id="edit-chapter-number-input"
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

              <div className="col-span-3">
                <label
                  htmlFor="edit-chapter-title-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  Chapter Name
                </label>
                <input
                  id="edit-chapter-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={80}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Renaming preserves the chapter's unique identifier so all board photos remain securely connected.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                id="cancel-edit-chapter-btn"
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                id="save-edit-chapter-btn"
                type="submit"
                variant="primary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
                disabled={!title.trim()}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
