/**
 * Easy Study Snap - Offline PDF Generator Engine (Phase 10: PDF Creation)
 *
 * Generates professional study PDFs from board photos 100% offline.
 * - Standard A4 dimensions with optimal photo aspect-ratio fitting.
 * - Elegant academic cover page with field, subject, chapter, and student name.
 * - Non-intrusive footer watermark with page tracking that never covers board notes.
 * - Sequential memory-safe image processing with live progress callbacks.
 */

import { jsPDF } from 'jspdf';
import { BoardPhoto, Chapter, Subject, AcademicField, UserProfile, StudyPDF } from '../types';

export interface PDFGenerationOptions {
  title: string;
  user: UserProfile;
  chapter: Chapter;
  subject: Subject;
  field: AcademicField | null;
  photos: BoardPhoto[];
  includeCoverPage?: boolean;
  onProgress?: (current: number, total: number, message: string) => void;
}

export interface PDFGenerationResult {
  pdf: StudyPDF;
  blob: Blob;
  blobUrl: string;
  dataUrl: string;
}

/**
 * Sanitizes a title for safe file naming across all operating systems
 */
export function sanitizeFileName(name: string): string {
  const clean = name
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\s+/g, '_')
    .trim();
  return (clean || 'Board_Notes') + '.pdf';
}

/**
 * Helper to load an image into an HTMLImageElement to obtain its intrinsic dimensions
 */
function loadImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 600 });
    };
    img.src = dataUrl;
  });
}

export const PDFGeneratorService = {
  /**
   * Generates a complete study PDF from selected board photos
   */
  async generateStudyPDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
    const {
      title,
      user,
      chapter,
      subject,
      field,
      photos,
      includeCoverPage = true,
      onProgress,
    } = options;

    if (photos.length === 0) {
      throw new Error('Cannot create PDF: No board photographs were selected.');
    }

    const totalPages = (includeCoverPage ? 1 : 0) + photos.length;
    let currentStep = 0;

    const report = (msg: string) => {
      currentStep++;
      if (onProgress) {
        onProgress(currentStep, totalPages, msg);
      }
    };

    report('Initializing document...');

    // Standard A4 dimensions in mm
    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;
    const MARGIN = 12; // 12mm side margins
    const FOOTER_HEIGHT = 14;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // ----------------------------------------------------
    // 1. COVER PAGE (Page 1)
    // ----------------------------------------------------
    if (includeCoverPage) {
      report('Designing academic cover page...');

      // Outer Decorative Border
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.8);
      doc.rect(MARGIN, MARGIN, PAGE_WIDTH - MARGIN * 2, PAGE_HEIGHT - MARGIN * 2, 'S');

      // Inner Accent Border
      doc.setDrawColor(99, 102, 241); // indigo-500
      doc.setLineWidth(0.3);
      doc.rect(MARGIN + 3, MARGIN + 3, PAGE_WIDTH - (MARGIN + 3) * 2, PAGE_HEIGHT - (MARGIN + 3) * 2, 'S');

      // Top Brand Header Banner
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(MARGIN + 8, MARGIN + 8, PAGE_WIDTH - (MARGIN + 8) * 2, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('EASY STUDY SNAP', PAGE_WIDTH / 2, MARGIN + 18, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(199, 210, 254); // indigo-200
      doc.text('OFFLINE BOARD STUDY DOCUMENT', PAGE_WIDTH / 2, MARGIN + 25, { align: 'center' });

      // Field / Track Tag
      if (field?.name) {
        doc.setFillColor(241, 245, 249); // slate-100
        doc.roundedRect(PAGE_WIDTH / 2 - 35, 65, 70, 8, 2, 2, 'F');
        doc.setTextColor(71, 85, 105); // slate-600
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Track: ${field.name}`, PAGE_WIDTH / 2, 70.5, { align: 'center' });
      }

      // Subject Badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(subject.name.toUpperCase(), PAGE_WIDTH / 2, 86, { align: 'center' });

      // Chapter Number & Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`CHAPTER ${chapter.chapterNumber}`, PAGE_WIDTH / 2, 98, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      const titleLines = doc.splitTextToSize(title, PAGE_WIDTH - 50);
      doc.text(titleLines, PAGE_WIDTH / 2, 112, { align: 'center' });

      // Divider Line
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.5);
      doc.line(PAGE_WIDTH / 2 - 40, 140, PAGE_WIDTH / 2 + 40, 140);

      // Metadata Summary Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(PAGE_WIDTH / 2 - 60, 155, 120, 48, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('DOCUMENT SUMMARY', PAGE_WIDTH / 2, 165, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Board Snapshots: ${photos.length} photos`, PAGE_WIDTH / 2 - 45, 177);
      doc.text(`Total Pages: ${totalPages} pages`, PAGE_WIDTH / 2 - 45, 185);
      doc.text(`Date Compiled: ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`, PAGE_WIDTH / 2 - 45, 193);

      // Creator Signature Section
      const studentDisplayName = user.name?.trim() || 'Student';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(`Created by ${studentDisplayName}`, PAGE_WIDTH / 2, 230, { align: 'center' });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Verified Study Material • Easy Study Snap', PAGE_WIDTH / 2, 238, { align: 'center' });

      // Cover Page Footer Watermark
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Easy Study Snap • Cover Page • 1 of ' + totalPages, PAGE_WIDTH / 2, PAGE_HEIGHT - 16, {
        align: 'center',
      });
    }

    // ----------------------------------------------------
    // 2. CONTENT PAGES (Photos 1 to N)
    // ----------------------------------------------------
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const pageIndex = (includeCoverPage ? 1 : 0) + i + 1;

      report(`Processing photo ${i + 1} of ${photos.length}...`);

      if (includeCoverPage || i > 0) {
        doc.addPage('a4', 'portrait');
      }

      // Printable boundaries (keeping safe clearance from margins and footer)
      const maxImgWidth = PAGE_WIDTH - MARGIN * 2; // 186mm
      const maxImgHeight = PAGE_HEIGHT - MARGIN * 2 - FOOTER_HEIGHT; // ~259mm

      try {
        const photoData = photo.localDataUrl || photo.thumbnailUrl || '';
        const dims = await loadImageDimensions(photoData);

        const imgAspect = dims.width / dims.height;
        const pageAspect = maxImgWidth / maxImgHeight;

        let renderWidth: number;
        let renderHeight: number;

        if (imgAspect > pageAspect) {
          // Wider than page aspect ratio -> fit to width
          renderWidth = maxImgWidth;
          renderHeight = maxImgWidth / imgAspect;
        } else {
          // Taller -> fit to height
          renderHeight = maxImgHeight;
          renderWidth = maxImgHeight * imgAspect;
        }

        // Center horizontally & vertically in content zone
        const posX = MARGIN + (maxImgWidth - renderWidth) / 2;
        const posY = MARGIN + (maxImgHeight - renderHeight) / 2;

        // Determine image format
        const format = photoData.startsWith('data:image/png') ? 'PNG' : 'JPEG';

        // Add the image to the PDF
        doc.addImage(photoData, format, posX, posY, renderWidth, renderHeight, undefined, 'FAST');

        // Thin photo frame border for a polished aesthetic
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(posX, posY, renderWidth, renderHeight, 'S');
      } catch (err) {
        console.error(`Failed to embed photo ${photo.id} into PDF:`, err);
        // Fallback: draw placeholder box indicating image load issue
        doc.setFillColor(241, 245, 249);
        doc.rect(MARGIN, MARGIN, maxImgWidth, maxImgHeight, 'F');
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(10);
        doc.text(`[Board Photo #${i + 1} - Image Preview Placeholder]`, PAGE_WIDTH / 2, PAGE_HEIGHT / 2, {
          align: 'center',
        });
      }

      // ----------------------------------------------------
      // Subtle Footer Watermark (never obscures board notes)
      // ----------------------------------------------------
      const footerY = PAGE_HEIGHT - 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400

      // Left: Subject & Chapter title
      const shortSubject = subject.name.length > 20 ? subject.name.slice(0, 18) + '...' : subject.name;
      doc.text(`${shortSubject} • Ch. ${chapter.chapterNumber}`, MARGIN, footerY);

      // Center: Brand Watermark
      doc.text('Easy Study Snap', PAGE_WIDTH / 2, footerY, { align: 'center' });

      // Right: Page count
      doc.text(`Page ${pageIndex} of ${totalPages}`, PAGE_WIDTH - MARGIN, footerY, { align: 'right' });
    }

    report('Verifying and compiling PDF binary...');

    // Export Blob and DataURL
    const blob = doc.output('blob');
    const dataUrl = doc.output('datauristring');
    const blobUrl = URL.createObjectURL(blob);
    const fileSizeBytes = blob.size;

    const fileName = sanitizeFileName(title);
    const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const studentDisplayName = user.name?.trim() || 'Student';

    const studyPdfRecord: StudyPDF = {
      id: pdfId,
      userId: user.id,
      fieldId: field?.id || 'field_default',
      fieldName: field?.name || 'Academic Track',
      subjectId: subject.id,
      subjectName: subject.name,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterNumber: chapter.chapterNumber,
      title: title.trim(),
      fileName,
      pageCount: totalPages,
      photoCount: photos.length,
      fileSizeBytes,
      photoIds: photos.map((p) => p.id),
      creatorName: `Created by ${studentDisplayName}`,
      localBlobUrl: blobUrl,
      pdfDataUrl: dataUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      syncStatus: 'pending',
    };

    return {
      pdf: studyPdfRecord,
      blob,
      blobUrl,
      dataUrl,
    };
  },
};
