/**
 * Easy Study Snap - Chapter Detail View
 * Phase 7: Board Photo Hub with Camera Capture & Gallery Import
 */

import React, { useState, useEffect } from 'react';
import { Chapter, Subject, AcademicField, BoardPhoto, UserProfile, StudyPDF } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { PhotoThumbnailCard } from './PhotoThumbnailCard';
import { FullscreenPhotoViewer } from '../modals/FullscreenPhotoViewer';
import { DeletePhotoModal } from '../modals/DeletePhotoModal';
import { GalleryImportModal } from '../gallery/GalleryImportModal';
import { ReorderPhotosModal } from './ReorderPhotosModal';
import { PhotoEditorModal } from '../editor/PhotoEditorModal';
import { CreatePdfModal } from '../pdf/CreatePdfModal';
import { PdfViewerModal } from '../pdf/PdfViewerModal';
import { PDFStorageService } from '../../services/pdfStorage';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Camera,
  Upload,
  FileText,
  Clock,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowUpDown,
  Image as ImageIcon,
  Sliders,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ChapterDetailViewProps {
  user: UserProfile;
  chapter: Chapter;
  subject: Subject;
  field: AcademicField | null;
  onBack: () => void;
  onToggleComplete: (chapterId: string) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  onOpenBoardCamera: () => void;
  onDeletePhoto: (photoId: string) => void;
  onImportPhotos: (importedPhotos: BoardPhoto[]) => void;
  onReorderPhotos: (reorderedPhotos: BoardPhoto[]) => void;
  onSaveEditedPhoto?: (updatedPhoto: BoardPhoto) => Promise<void>;
  onRestoreOriginalPhoto?: (photo: BoardPhoto) => Promise<void>;
  photos: BoardPhoto[];
}

export const ChapterDetailView: React.FC<ChapterDetailViewProps> = ({
  user,
  chapter,
  subject,
  field,
  onBack,
  onToggleComplete,
  onEditChapter,
  onDeleteChapter,
  onOpenBoardCamera,
  onDeletePhoto,
  onImportPhotos,
  onReorderPhotos,
  onSaveEditedPhoto,
  onRestoreOriginalPhoto,
  photos,
}) => {
  // Modal states
  const [selectedPhotoForViewer, setSelectedPhotoForViewer] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<BoardPhoto | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<BoardPhoto | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // PDF states (Phase 10)
  const [existingPdf, setExistingPdf] = useState<StudyPDF | null>(null);
  const [isCreatePdfModalOpen, setIsCreatePdfModalOpen] = useState(false);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);

  const loadChapterPdf = async () => {
    try {
      const pdf = await PDFStorageService.getPDFByChapter(user.id, chapter.id);
      setExistingPdf(pdf);
    } catch (e) {
      console.error('Failed to load chapter PDF', e);
    }
  };

  useEffect(() => {
    loadChapterPdf();
  }, [user.id, chapter.id, photos.length]);

  const photoCount = photos.length;
  const isPdfOutdated =
    existingPdf &&
    existingPdf.photoIds &&
    photoCount > 0 &&
    existingPdf.photoIds.length !== photoCount;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          id="back-to-chapters-btn"
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onBack}
        >
          Back to {subject.name} Chapters
        </Button>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1">
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
            {field?.name || 'Field'}
          </span>
          <span>/</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
          <span>/</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Ch. {chapter.chapterNumber}
          </span>
        </div>
      </div>

      {/* Chapter Title & Header Banner */}
      <Card
        id={`chapter-detail-header-${chapter.id}`}
        className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border-0 shadow-xl p-6 sm:p-7 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                Chapter {chapter.chapterNumber}
              </span>

              {chapter.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ✓ Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  In Progress
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {chapter.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Part of <strong>{subject.name}</strong> •{' '}
              {field?.name ? <span>Track: {field.name}</span> : null}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              id="edit-chapter-detail-btn"
              variant="outline"
              size="sm"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => onEditChapter(chapter)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Rename
            </Button>

            <Button
              id="delete-chapter-detail-btn"
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
              onClick={() => onDeleteChapter(chapter)}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-400/30"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Completion Toggle Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {new Date(chapter.updatedAt || Date.now()).toLocaleDateString()}
          </div>

          <button
            type="button"
            id="toggle-chapter-completed-btn"
            onClick={() => onToggleComplete(chapter.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              chapter.isCompleted
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                : 'bg-indigo-600/60 hover:bg-indigo-600 text-white border border-indigo-400/30'
            }`}
          >
            {chapter.isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as In Progress
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                Mark as Completed
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Action Foundation Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Chapter Actions & Photo Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Action 1: Capture Board Photo (Camera) */}
          <div
            id="capture-board-tool-card"
            onClick={onOpenBoardCamera}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 hover:border-indigo-500 shadow-sm space-y-2.5 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Camera Live
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Capture Board</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Take classroom whiteboard snapshots with continuous fast capture.
              </p>
            </div>
            <div className="pt-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Launch Camera Now →
            </div>
          </div>

          {/* Action 2: Import from Gallery (PHASE 7 ACTIVE) */}
          <div
            id="import-gallery-tool-card"
            onClick={() => setIsGalleryModalOpen(true)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 hover:border-emerald-500 shadow-sm space-y-2.5 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Phase 7 Active
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Import from Gallery</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Choose multiple photos from your device, reorder, and import.
              </p>
            </div>
            <div className="pt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Select Photos →
            </div>
          </div>

          {/* Action 3: Compile Study PDF (PHASE 10 ACTIVE) */}
          <div
            id="compile-pdf-tool-card"
            onClick={() => {
              if (photoCount === 0) {
                alert('Please capture or import at least 1 board photo before creating a PDF.');
                return;
              }
              setIsCreatePdfModalOpen(true);
            }}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-sm space-y-2.5 cursor-pointer transition-all hover:shadow-md group ${
              existingPdf
                ? 'border-indigo-500/40 hover:border-indigo-500'
                : photoCount > 0
                ? 'border-red-500/40 hover:border-red-500'
                : 'border-slate-200 dark:border-slate-800 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              {existingPdf ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {isPdfOutdated ? 'Update Available' : 'PDF Ready'}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  Phase 10 Ready
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>{existingPdf ? 'Re-create / View PDF' : 'Create Study PDF'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {existingPdf
                  ? `Generated ${existingPdf.pageCount} pages. Tap to review, update, or download.`
                  : 'Compile board snapshots into a clean offline A4 PDF with academic cover page.'}
              </p>
            </div>
            <div className="pt-1 text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {existingPdf ? 'Manage Document →' : 'Generate PDF Now →'}
            </div>
          </div>
        </div>
      </div>

      {/* Board Photographs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Board Photographs
            </h2>
            <Badge variant="neutral" className="text-xs font-semibold">
              {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
            </Badge>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Create / View PDF Button (Phase 10) */}
            {photoCount > 0 && (
              existingPdf ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    id="chapter-view-pdf-btn"
                    variant="outline"
                    size="sm"
                    icon={<FileText className="w-4 h-4 text-red-500" />}
                    onClick={() => setIsPdfViewerModalOpen(true)}
                    className="border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                  >
                    View PDF ({existingPdf.pageCount}p)
                  </Button>
                  <Button
                    id="chapter-update-pdf-btn"
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${isPdfOutdated ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />}
                    onClick={() => setIsCreatePdfModalOpen(true)}
                    title="Re-create / Update PDF"
                  >
                    {isPdfOutdated ? 'Update' : 'Re-create'}
                  </Button>
                </div>
              ) : (
                <Button
                  id="chapter-create-pdf-btn"
                  variant="outline"
                  size="sm"
                  icon={<FileText className="w-4 h-4 text-red-500" />}
                  onClick={() => setIsCreatePdfModalOpen(true)}
                  className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Create PDF
                </Button>
              )
            )}

            {/* Reorder Photos button when multiple photos exist */}
            {photoCount > 1 && (
              <Button
                id="reorder-photos-btn"
                variant="outline"
                size="sm"
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                onClick={() => setIsReorderModalOpen(true)}
              >
                Reorder
              </Button>
            )}

            {/* Import from Gallery */}
            <Button
              id="chapter-gallery-import-btn"
              variant="outline"
              size="sm"
              icon={<Upload className="w-4 h-4 text-emerald-500" />}
              onClick={() => setIsGalleryModalOpen(true)}
            >
              Import Gallery
            </Button>

            {/* Capture Board with Camera */}
            <Button
              id="chapter-quick-capture-btn"
              variant="primary"
              size="sm"
              icon={<Camera className="w-4 h-4" />}
              onClick={onOpenBoardCamera}
            >
              Capture Board
            </Button>
          </div>
        </div>

        {/* Photos Grid or Empty State */}
        {photoCount > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <PhotoThumbnailCard
                key={photo.id}
                photo={photo}
                index={index}
                onPreview={(p) => setSelectedPhotoForViewer(p.id)}
                onEdit={(p) => {
                  setSelectedPhotoForViewer(null);
                  setEditingPhoto(p);
                }}
                onDelete={(p) => setPhotoToDelete(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty State when no photos captured yet */
          <Card className="p-8 sm:p-12 text-center space-y-4 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
              <Camera className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                No board photos yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Capture your first board photo and it will appear here.
              </p>
            </div>

            {/* Dual Action Buttons in Empty State */}
            <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
              <Button
                id="empty-state-capture-btn"
                variant="primary"
                size="md"
                icon={<Camera className="w-4 h-4" />}
                onClick={onOpenBoardCamera}
              >
                Capture Board
              </Button>

              <Button
                id="empty-state-gallery-btn"
                variant="outline"
                size="md"
                icon={<Upload className="w-4 h-4 text-emerald-500" />}
                onClick={() => setIsGalleryModalOpen(true)}
              >
                Import from Gallery
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Structural Hierarchy Educational Card */}
      <Card className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>
            Hierarchy: <strong>{field?.name}</strong> → <strong>{subject.name}</strong> → <strong>Ch. {chapter.chapterNumber}: {chapter.title}</strong> → <strong>{photoCount} Board Photos</strong>
          </span>
        </div>
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Easy Study Snap Phase 8 (Photo Editing & Readability)
        </span>
      </Card>

      {/* Gallery Import Modal (Phase 7) */}
      <GalleryImportModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        user={user}
        chapter={chapter}
        subject={subject}
        field={field}
        existingPhotoCount={photos.length}
        onImportComplete={(imported) => {
          onImportPhotos(imported);
          setIsGalleryModalOpen(false);
        }}
      />

      {/* Reorder Photos Modal (Phase 7) */}
      <ReorderPhotosModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        photos={photos}
        chapter={chapter}
        subject={subject}
        onSaveOrder={(reordered) => {
          onReorderPhotos(reordered);
          setIsReorderModalOpen(false);
        }}
      />

      {/* Fullscreen Multi-Photo Swipeable Viewer (Phase 7 & 8) */}
      <FullscreenPhotoViewer
        isOpen={!!selectedPhotoForViewer}
        onClose={() => setSelectedPhotoForViewer(null)}
        photos={photos}
        initialPhotoId={selectedPhotoForViewer}
        chapter={chapter}
        subject={subject}
        onEditPhoto={(p) => {
          setSelectedPhotoForViewer(null);
          setEditingPhoto(p);
        }}
        onDeletePhoto={(p) => {
          setSelectedPhotoForViewer(null);
          setPhotoToDelete(p);
        }}
      />

      {/* Photo Editor & Readability Suite Modal (Phase 8) */}
      <PhotoEditorModal
        isOpen={!!editingPhoto}
        onClose={() => setEditingPhoto(null)}
        photo={editingPhoto}
        chapter={chapter}
        subject={subject}
        onSavePhoto={async (updated) => {
          if (onSaveEditedPhoto) {
            await onSaveEditedPhoto(updated);
          }
          setEditingPhoto(null);
        }}
        onRestoreOriginal={async (restored) => {
          if (onRestoreOriginalPhoto) {
            await onRestoreOriginalPhoto(restored);
          } else if (onSaveEditedPhoto) {
            await onSaveEditedPhoto(restored);
          }
          setEditingPhoto(null);
        }}
      />

      {/* Delete Photo Confirmation Modal */}
      <DeletePhotoModal
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        photo={photoToDelete}
        chapter={chapter}
        onConfirm={(photoId) => {
          onDeletePhoto(photoId);
          setPhotoToDelete(null);
        }}
      />

      {/* Create / Re-create PDF Modal (Phase 10) */}
      <CreatePdfModal
        isOpen={isCreatePdfModalOpen}
        onClose={() => setIsCreatePdfModalOpen(false)}
        onSuccess={(createdPdf) => {
          setIsCreatePdfModalOpen(false);
          setExistingPdf(createdPdf);
          setIsPdfViewerModalOpen(true);
        }}
        user={user}
        chapter={chapter}
        subject={subject}
        field={field}
        initialPhotos={photos}
        existingPdf={existingPdf}
      />

      {/* In-App PDF Viewer Modal (Phase 10) */}
      <PdfViewerModal
        pdf={existingPdf}
        isOpen={isPdfViewerModalOpen}
        onClose={() => setIsPdfViewerModalOpen(false)}
        onUpdateRequested={() => {
          setIsPdfViewerModalOpen(false);
          setIsCreatePdfModalOpen(true);
        }}
      />
    </div>
  );
};
