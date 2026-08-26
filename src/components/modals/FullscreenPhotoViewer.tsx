/**
 * Easy Study Snap - Full-Screen Swipeable Photo Viewer
 * Phase 7: Photo Navigation & Study Review
 * 
 * Provides smooth left/right navigation, touch swipe support, keyboard shortcuts,
 * position indicators (Photo X of Y), source tagging, and quick actions.
 */

import React, { useState, useEffect, useCallback, TouchEvent } from 'react';
import { BoardPhoto, Chapter, Subject } from '../../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Calendar,
  Camera,
  Upload,
  Image as ImageIcon,
  Maximize,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';

interface FullscreenPhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  photos: BoardPhoto[];
  initialPhotoId: string | null;
  chapter: Chapter;
  subject: Subject;
  onDeletePhoto: (photo: BoardPhoto) => void;
  onEditPhoto?: (photo: BoardPhoto) => void;
}

export const FullscreenPhotoViewer: React.FC<FullscreenPhotoViewerProps> = ({
  isOpen,
  onClose,
  photos,
  initialPhotoId,
  chapter,
  subject,
  onDeletePhoto,
  onEditPhoto,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Sync index when modal opens with initial photo
  useEffect(() => {
    if (initialPhotoId && photos.length > 0) {
      const idx = photos.findIndex((p) => p.id === initialPhotoId);
      if (idx >= 0) {
        setCurrentIndex(idx);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [initialPhotoId, photos]);

  const currentPhoto: BoardPhoto | undefined = photos[currentIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !currentPhoto || photos.length === 0) return null;

  // Touch Swipe handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe threshold (50px)
    if (diffX > 50) {
      handleNext();
    } else if (diffX < -50) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const formattedDate = new Date(currentPhoto.createdAt).toLocaleString();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.localDataUrl;
    link.download = `EasyStudySnap_${subject.name}_Ch${chapter.chapterNumber}_Photo${currentPhoto.orderIndex}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-150 select-none">
      {/* Top Header Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
        <div className="space-y-0.5 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 font-bold text-xs uppercase tracking-wider text-white shadow-sm">
              Photo {currentIndex + 1} of {photos.length}
            </span>

            {currentPhoto.source === 'gallery' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                <Upload className="w-3 h-3" />
                Gallery Import
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[11px] font-medium border border-sky-500/30">
                <Camera className="w-3 h-3" />
                Board Camera
              </span>
            )}
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-sm">
            {subject.name} • Ch. {chapter.chapterNumber}: {chapter.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Photo Action (Phase 8) */}
          {onEditPhoto && (
            <Button
              id="viewer-edit-photo-btn"
              variant="primary"
              size="sm"
              icon={<Sliders className="w-4 h-4" />}
              onClick={() => onEditPhoto(currentPhoto)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md"
            >
              <span className="inline">Edit</span>
            </Button>
          )}

          {/* Download Copy */}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Delete Active Photo */}
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => onDeletePhoto(currentPhoto)}
            className="bg-rose-600/80 hover:bg-rose-600 text-white"
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>

          {/* Close Viewer */}
          <button
            type="button"
            id="close-fullscreen-viewer-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Viewer (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Left Navigation Arrow */}
      {photos.length > 1 && (
        <button
          type="button"
          id="viewer-prev-btn"
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-110 shadow-xl focus:outline-none"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Area with Touch Swipe Detection */}
      <div
        className="w-full h-full flex items-center justify-center p-4 sm:p-16 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={currentPhoto.id}
          src={currentPhoto.localDataUrl}
          alt={`Board Snapshot ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-200"
        />
      </div>

      {/* Right Navigation Arrow */}
      {photos.length > 1 && (
        <button
          type="button"
          id="viewer-next-btn"
          onClick={handleNext}
          className="absolute right-3 sm:right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all hover:scale-110 shadow-xl focus:outline-none"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Information Footer Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 py-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Captured {formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Resolution: {currentPhoto.width} × {currentPhoto.height}px</span>
          </div>
        </div>

        {/* Thumbnail Filmstrip on Desktop */}
        {photos.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-xs sm:max-w-md">
            {photos.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-7 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-indigo-500 scale-105 shadow-md ring-1 ring-indigo-400'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={p.thumbnailUrl || p.localDataUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
