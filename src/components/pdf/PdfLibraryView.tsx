import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  BookOpen,
  Eye,
  Calendar,
  Layers,
  HardDrive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { StudyPDF, UserProfile, Chapter, Subject, AcademicField, BoardPhoto } from '../../types';
import { PDFStorageService } from '../../services/pdfStorage';
import { StorageService } from '../../services/storage';
import { PhotoStorageService } from '../../services/photoStorage';
import { PdfViewerModal } from './PdfViewerModal';
import { CreatePdfModal } from './CreatePdfModal';

interface PdfLibraryViewProps {
  user: UserProfile;
  onNavigateToChapter?: (fieldId: string, subjectId: string, chapterId: string) => void;
}

export const PdfLibraryView: React.FC<PdfLibraryViewProps> = ({ user, onNavigateToChapter }) => {
  const [pdfs, setPdfs] = useState<StudyPDF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'pages'>('newest');

  // Modal states
  const [viewingPdf, setViewingPdf] = useState<StudyPDF | null>(null);
  const [pdfToDelete, setPdfToDelete] = useState<StudyPDF | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-create / Update PDF states
  const [updateModalData, setUpdateModalData] = useState<{
    isOpen: boolean;
    chapter: Chapter | null;
    subject: Subject | null;
    field: AcademicField | null;
    photos: BoardPhoto[];
    existingPdf: StudyPDF | null;
  }>({
    isOpen: false,
    chapter: null,
    subject: null,
    field: null,
    photos: [],
    existingPdf: null,
  });

  // Photo counts map per chapter to detect if a PDF is outdated
  const [chapterPhotoCounts, setChapterPhotoCounts] = useState<Record<string, number>>({});

  const subjects = useMemo(() => {
    return StorageService.getSubjects(user.id);
  }, [user.id]);

  const loadPDFs = async () => {
    setIsLoading(true);
    try {
      const list = await PDFStorageService.getPDFsByUser(user.id);
      setPdfs(list);

      // Load photo counts for each chapter to determine if PDF is outdated
      const counts: Record<string, number> = {};
      for (const pdf of list) {
        if (!counts[pdf.chapterId]) {
          const photos = await PhotoStorageService.getPhotosByChapter(user.id, pdf.chapterId);
          counts[pdf.chapterId] = photos.length;
        }
      }
      setChapterPhotoCounts(counts);
    } catch (err) {
      console.error('Failed to load PDFs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPDFs();
  }, [user.id]);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (pdf: StudyPDF, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const fileUrl = pdf.pdfDataUrl || pdf.localBlobUrl || '';
      if (!fileUrl) return;
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = pdf.fileName || `${pdf.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handleShare = async (pdf: StudyPDF, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (pdf.pdfDataUrl) {
          const res = await fetch(pdf.pdfDataUrl);
          const blob = await res.blob();
          const file = new File([blob], pdf.fileName, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: pdf.title,
              text: `Study Notes for ${pdf.title} (${pdf.subjectName})`,
            });
            return;
          }
        }
        await navigator.share({
          title: pdf.title,
          text: `Study Notes: ${pdf.title} (${pdf.subjectName})`,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleDownload(pdf);
        }
      }
    } else {
      handleDownload(pdf);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pdfToDelete) return;
    setIsDeleting(true);
    try {
      await PDFStorageService.deletePDF(user.id, pdfToDelete.id);
      setPdfs((prev) => prev.filter((p) => p.id !== pdfToDelete.id));
      setPdfToDelete(null);
    } catch (err) {
      console.error('Failed to delete PDF:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLaunchUpdateModal = async (pdf: StudyPDF, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const chapters = StorageService.getChapters(user.id);
      const chapter = chapters.find((c) => c.id === pdf.chapterId);
      if (!chapter) {
        alert('Chapter not found.');
        return;
      }

      const allSubjects = StorageService.getSubjects(user.id);
      const subject = allSubjects.find((s) => s.id === chapter.subjectId) || {
        id: chapter.subjectId,
        userId: user.id,
        name: pdf.subjectName,
        fieldId: 'field_pre_eng',
        iconName: 'BookOpen' as const,
        colorTheme: 'blue' as const,
        chapterCount: 0,
        photoCount: 0,
        createdAt: 0,
        syncStatus: 'synced' as const,
      };

      const allFields = StorageService.getFields(user.id);
      const field = allFields.find((f) => f.id === subject.fieldId) || null;

      const photos = await PhotoStorageService.getPhotosByChapter(user.id, chapter.id);

      setUpdateModalData({
        isOpen: true,
        chapter,
        subject,
        field,
        photos,
        existingPdf: pdf,
      });
    } catch (err) {
      console.error('Failed to prepare update modal:', err);
    }
  };

  // Filter and sort PDFs
  const filteredPdfs = useMemo(() => {
    return pdfs
      .filter((pdf) => {
        // Subject Filter
        if (selectedSubjectId !== 'all' && pdf.subjectId !== selectedSubjectId) {
          return false;
        }
        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = pdf.title.toLowerCase().includes(q);
          const matchSubject = pdf.subjectName.toLowerCase().includes(q);
          const matchChapter = pdf.chapterTitle.toLowerCase().includes(q);
          const matchField = (pdf.fieldName || '').toLowerCase().includes(q);
          return matchTitle || matchSubject || matchChapter || matchField;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
        if (sortBy === 'oldest') return (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'pages') return b.pageCount - a.pageCount;
        return 0;
      });
  }, [pdfs, searchQuery, selectedSubjectId, sortBy]);

  // Aggregate stats
  const totalPagesCount = useMemo(() => pdfs.reduce((acc, p) => acc + (p.pageCount || 0), 0), [pdfs]);
  const totalStorageBytes = useMemo(() => pdfs.reduce((acc, p) => acc + (p.fileSizeBytes || 0), 0), [pdfs]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Study PDFs</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Turn classroom boards into professional offline PDF study material
            </p>
          </div>

          {/* Aggregate Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              {pdfs.length} {pdfs.length === 1 ? 'PDF' : 'PDFs'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              {totalPagesCount} Pages
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
              {formatBytes(totalStorageBytes)}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="max-w-6xl mx-auto mt-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by chapter, subject, title..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="pages">Most Pages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 w-full flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-medium">Loading study PDF library...</p>
          </div>
        ) : filteredPdfs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {searchQuery || selectedSubjectId !== 'all' ? 'No matching PDFs found' : 'No Study PDFs Created Yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {searchQuery || selectedSubjectId !== 'all'
                ? 'Try adjusting your search query or subject filter to find your documents.'
                : 'Turn your board photographs into clean study documents. Open any chapter with photos and tap "Create PDF".'}
            </p>

            {(searchQuery || selectedSubjectId !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubjectId('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPdfs.map((pdf) => {
              const currentChapterPhotoCount = chapterPhotoCounts[pdf.chapterId] || 0;
              const isOutdated =
                pdf.photoIds &&
                currentChapterPhotoCount > 0 &&
                currentChapterPhotoCount !== pdf.photoIds.length;

              return (
                <div
                  key={pdf.id}
                  onClick={() => setViewingPdf(pdf)}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-600 shadow-xs hover:shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Row: Subject Badge & Status */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 truncate">
                        {pdf.subjectName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {pdf.syncStatus === 'synced' ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
                            title="Synced to cloud"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Synced
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                            title="Saved offline locally"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PDF Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {pdf.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Chapter {pdf.chapterNumber}: {pdf.chapterTitle}
                    </p>

                    {/* Outdated Notice Badge */}
                    {isOutdated && (
                      <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                          New photos in chapter
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleLaunchUpdateModal(pdf, e)}
                          className="text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata & Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {pdf.pageCount} Pages
                      </span>
                      <span>{formatBytes(pdf.fileSizeBytes)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(pdf.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Quick Button Toolbar */}
                    <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingPdf(pdf)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer"
                          title="Open in-app PDF viewer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Open
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownload(pdf, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-90 cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleShare(pdf, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-90 cursor-pointer"
                          title="Share PDF"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleLaunchUpdateModal(pdf, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 active:scale-90 cursor-pointer"
                          title="Re-create or update PDF"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPdfToDelete(pdf);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-150 active:scale-90 cursor-pointer"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-App PDF Viewer Modal */}
      <PdfViewerModal
        pdf={viewingPdf}
        isOpen={!!viewingPdf}
        onClose={() => setViewingPdf(null)}
        onUpdateRequested={(pdf) => {
          setViewingPdf(null);
          handleLaunchUpdateModal(pdf);
        }}
      />

      {/* Re-create / Update PDF Modal */}
      {updateModalData.isOpen && updateModalData.chapter && updateModalData.subject && (
        <CreatePdfModal
          isOpen={updateModalData.isOpen}
          onClose={() =>
            setUpdateModalData((prev) => ({
              ...prev,
              isOpen: false,
            }))
          }
          onSuccess={(newPdf) => {
            setUpdateModalData((prev) => ({
              ...prev,
              isOpen: false,
            }));
            loadPDFs();
            setViewingPdf(newPdf);
          }}
          user={user}
          chapter={updateModalData.chapter}
          subject={updateModalData.subject}
          field={updateModalData.field}
          initialPhotos={updateModalData.photos}
          existingPdf={updateModalData.existingPdf}
        />
      )}

      {/* Delete PDF Confirmation Modal */}
      {pdfToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Move Study PDF to Recently Deleted?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                "{pdfToDelete.title}"
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-left text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <span>📸 Source Photos Intact</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Moving this PDF to Recently Deleted will <span className="underline font-bold">never</span> delete your original board photographs. The PDF will remain in Recently Deleted for 30 days.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPdfToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? 'Moving...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
