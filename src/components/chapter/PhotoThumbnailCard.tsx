import React from 'react';
import { BoardPhoto } from '../../types';
import { Trash2, Maximize2, Clock, Camera, Upload, Sliders, Sparkles, CloudCheck, CloudUpload } from 'lucide-react';

interface PhotoThumbnailCardProps {
  photo: BoardPhoto;
  index: number;
  onPreview: (photo: BoardPhoto) => void;
  onEdit?: (photo: BoardPhoto) => void;
  onDelete: (photo: BoardPhoto) => void;
}

export const PhotoThumbnailCard: React.FC<PhotoThumbnailCardProps> = ({
  photo,
  index,
  onPreview,
  onEdit,
  onDelete,
}) => {
  const formattedTime = new Date(photo.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isEdited =
    Boolean(photo.originalDataUrl) ||
    photo.rotation !== 0 ||
    photo.filterMode !== 'normal' ||
    (photo.brightness && photo.brightness !== 0) ||
    (photo.contrast && photo.contrast !== 0);

  const isCloudSynced = photo.syncStatus === 'synced' || Boolean(photo.cloudUrl);

  return (
    <div
      id={`photo-card-${photo.id}`}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-all duration-200 ease-out hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-950/40 hover:border-indigo-400/80 dark:hover:border-indigo-500/70 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]"
    >
      {/* Thumbnail Aspect Area */}
      <div
        className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => onPreview(photo)}
      >
        <img
          src={photo.thumbnailUrl || photo.localDataUrl}
          alt={photo.fileName || `Board Snapshot ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Sequence Badge */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-xs select-none">
          <span>Photo #{photo.orderIndex || index + 1}</span>
        </div>

        {/* Sync, Source & Edited Badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 select-none">
          {/* Cloud Sync Status Icon */}
          <div
            className={`px-1.5 py-0.5 rounded-md backdrop-blur-md text-[10px] font-semibold border flex items-center gap-1 shadow-xs transition-transform duration-150 ${
              isCloudSynced
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-950/70 text-amber-300 border-amber-500/30'
            }`}
            title={isCloudSynced ? 'Photo synced to cloud backup' : 'Photo stored locally, waiting for sync'}
          >
            {isCloudSynced ? (
              <CloudCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <CloudUpload className="w-3 h-3 text-amber-400" />
            )}
          </div>

          {isEdited && (
            <div className="px-2 py-0.5 rounded-md bg-indigo-500/80 backdrop-blur-md text-white text-[10px] font-semibold border border-indigo-300/30 flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Edited</span>
            </div>
          )}

          <div className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-medium border border-white/10 flex items-center gap-1 shadow-xs">
            {photo.source === 'gallery' ? (
              <>
                <Upload className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Gallery</span>
              </>
            ) : (
              <>
                <Camera className="w-3 h-3 text-sky-400" />
                <span className="text-sky-300">Camera</span>
              </>
            )}
          </div>
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Fullscreen</span>
          </div>
        </div>
      </div>

      {/* Card Info & Actions Footer */}
      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="shrink-0">{formattedTime}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="font-mono text-[11px] text-slate-400 truncate">
            {photo.width}×{photo.height}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Edit Button */}
          {onEdit && (
            <button
              type="button"
              id={`edit-photo-btn-${photo.id}`}
              onClick={() => onEdit(photo)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-150 active:scale-90 cursor-pointer"
              title="Edit & Enhance Photo"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Preview Button */}
          <button
            type="button"
            id={`preview-photo-btn-${photo.id}`}
            onClick={() => onPreview(photo)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-150 active:scale-90 cursor-pointer"
            title="Preview Full Photo"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            id={`delete-photo-btn-${photo.id}`}
            onClick={() => onDelete(photo)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-150 active:scale-90 cursor-pointer"
            title="Delete Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

