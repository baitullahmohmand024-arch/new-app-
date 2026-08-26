import React, { useState } from 'react';
import { Subject, Chapter } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Camera, Image as ImageIcon, BookOpen, Layers, Plus, X, AlertCircle } from 'lucide-react';

interface QuickCaptureDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  chapters: Chapter[];
  targetAction: 'camera' | 'import';
  onProceed: (subject: Subject, chapter: Chapter, action: 'camera' | 'import') => void;
  onAddNewChapter: (subject: Subject) => void;
}

export const QuickCaptureDestinationModal: React.FC<QuickCaptureDestinationModalProps> = ({
  isOpen,
  onClose,
  subjects,
  chapters,
  targetAction,
  onProceed,
  onAddNewChapter,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  if (!isOpen) return null;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectChapters = chapters.filter(
    (c) => c.subjectId === currentSubject?.id && !c.isDeleted
  );

  const selectedChapter =
    subjectChapters.find((c) => c.id === selectedChapterId) || subjectChapters[0];

  const handleConfirm = () => {
    if (!currentSubject) return;
    if (!selectedChapter) {
      // Prompt user to add chapter
      onAddNewChapter(currentSubject);
      onClose();
      return;
    }
    onProceed(currentSubject, selectedChapter, targetAction);
    onClose();
  };

  return (
    <div
      id="quick-capture-destination-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200"
    >
      <div className="w-full max-w-md animate-modal-enter">
        <Card
          id="quick-capture-destination-modal-content"
          className="shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {targetAction === 'camera' ? <Camera className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {targetAction === 'camera' ? 'Capture Board Snapshot' : 'Import Photos from Gallery'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select where these notes belong
                </p>
              </div>
            </div>
            <button
              id="close-quick-capture-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Step 1: Select Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Target Subject
              </label>
              {subjects.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {subjects.map((sub) => {
                    const isSelected = sub.id === (currentSubject?.id || selectedSubjectId);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(sub.id);
                          setSelectedChapterId('');
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <span className="truncate">{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  No subjects available in this track. Please create a subject first.
                </div>
              )}
            </div>

            {/* Step 2: Select Chapter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  2. Target Chapter
                </label>
                {currentSubject && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddNewChapter(currentSubject);
                      onClose();
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> New Chapter
                  </button>
                )}
              </div>

              {subjectChapters.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {subjectChapters.map((chap) => {
                    const isSelected = chap.id === (selectedChapter?.id || selectedChapterId);
                    return (
                      <button
                        key={chap.id}
                        type="button"
                        onClick={() => setSelectedChapterId(chap.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                            Ch. {chap.chapterNumber}
                          </span>
                          <span className="truncate">{chap.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          {chap.photoCount || 0} photos
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    No chapters in <strong>{currentSubject?.name || 'this subject'}</strong> yet.
                  </p>
                  {currentSubject && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => {
                        onAddNewChapter(currentSubject);
                        onClose();
                      }}
                    >
                      Create Chapter 1
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!currentSubject || !selectedChapter}
                icon={targetAction === 'camera' ? <Camera className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                onClick={handleConfirm}
              >
                {targetAction === 'camera' ? 'Open Board Camera' : 'Proceed to Import'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
