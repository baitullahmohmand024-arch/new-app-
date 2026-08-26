import React from 'react';
import { BoardPhoto, Chapter, Subject } from '../../types';
import { X, Clock, Trash2, Download, Calendar, Layers, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: BoardPhoto | null;
  chapter: Chapter;
  subject: Subject;
  onDelete: (photo: BoardPhoto) => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  isOpen,
  onClose,
  photo,
  chapter,
  subject,
  onDelete,
}) => {
  if (!isOpen || !photo) return null;

  const formattedDate = new Date(photo.createdAt).toLocaleString();

  // Download local copy helper
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.localDataUrl;
    link.download = `EasyStudySnap_${subject.name}_Ch${chapter.chapterNumber}_Photo${photo.orderIndex}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="photo-preview-modal"
        className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Modal Header */}
        <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-[11px] font-bold uppercase tracking-wider text-white">
                Photo #{photo.orderIndex}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {subject.name} • Ch. {chapter.chapterNumber}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {chapter.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Save
            </Button>

            <button
              type="button"
              id="close-photo-preview-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main High-Resolution Image Area */}
        <div className="flex-1 bg-black/60 p-4 flex items-center justify-center overflow-auto min-h-[300px] max-h-[60vh]">
          <img
            src={photo.localDataUrl}
            alt={`Classroom board snapshot #${photo.orderIndex}`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-white/10"
          />
        </div>

        {/* Bottom Details & Actions Footer */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Resolution: {photo.width} × {photo.height}px</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(photo);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
