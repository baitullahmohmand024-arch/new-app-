/**
 * Easy Study Snap - Reorder Photos Modal
 * Phase 7: Board Photo Arrangement & Organization
 * 
 * Allows students to reorganize the order of lecture board snapshots
 * inside the active chapter.
 */

import React, { useState } from 'react';
import { BoardPhoto, Chapter, Subject } from '../../types';
import { Button } from '../common/Button';
import {
  X,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  RotateCcw,
  Image as ImageIcon,
} from 'lucide-react';

interface ReorderPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: BoardPhoto[];
  chapter: Chapter;
  subject: Subject;
  onSaveOrder: (reorderedPhotos: BoardPhoto[]) => void;
}

export const ReorderPhotosModal: React.FC<ReorderPhotosModalProps> = ({
  isOpen,
  onClose,
  photos,
  chapter,
  subject,
  onSaveOrder,
}) => {
  const [items, setItems] = useState<BoardPhoto[]>(() => [...photos]);

  if (!isOpen) return null;

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...items];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setItems(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index < 0 || index >= items.length - 1) return;
    const copy = [...items];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setItems(copy);
  };

  const handleReset = () => {
    setItems([...photos]);
  };

  const handleSave = () => {
    // Assign updated order indices
    const updated = items.map((photo, index) => ({
      ...photo,
      orderIndex: index + 1,
    }));
    onSaveOrder(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="reorder-photos-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Reorder Chapter Photos
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {subject.name} • Ch. {chapter.chapterNumber}: {chapter.title}
            </p>
          </div>

          <button
            type="button"
            id="close-reorder-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Arrange photos in reading/lecture order:</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Order
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((photo, index) => (
              <div
                key={photo.id}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                {/* Sequence Badge */}
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  #{index + 1}
                </div>

                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                  <img
                    src={photo.thumbnailUrl || photo.localDataUrl}
                    alt={`Photo #${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {photo.fileName || `Board Snapshot #${photo.orderIndex}`}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(photo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {photo.width} × {photo.height}px
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button
            id="cancel-reorder-photos-btn"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            id="save-reorder-photos-btn"
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleSave}
          >
            Save Arrangement
          </Button>
        </div>
      </div>
    </div>
  );
};
