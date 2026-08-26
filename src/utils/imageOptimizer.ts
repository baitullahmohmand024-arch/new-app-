/**
 * Easy Study Snap - Image Processing & Optimization Utility
 * Phase 7: Gallery Import & Photo Management
 * 
 * Provides offline-first image compression, thumbnail generation, orientation correction,
 * and high-resolution classroom note simulation for testing.
 */

export interface ProcessedImageData {
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileName: string;
  originalSizeBytes: number;
}

export interface ImageCropRect {
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  width: number; // percentage 0 to 100
  height: number; // percentage 0 to 100
}

export interface ImageEditOptions {
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  filterMode: 'normal' | 'document' | 'high_contrast' | 'blackboard';
  crop?: ImageCropRect;
}

export class ImageOptimizer {
  /**
   * Applies editing transformations (Rotation, Crop, Brightness, Contrast, Document Mode)
   * in a single high-fidelity, offline Canvas pass.
   */
  static async applyImageEdits(options: ImageEditOptions): Promise<{
    dataUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // 1. Determine rotated source bounds
          const normalizedRotation = ((options.rotation % 360) + 360) % 360;
          const isSideways = normalizedRotation === 90 || normalizedRotation === 270;
          const rotatedWidth = isSideways ? originalHeight : originalWidth;
          const rotatedHeight = isSideways ? originalWidth : originalHeight;

          // Render rotation to an intermediate canvas
          const rotCanvas = document.createElement('canvas');
          rotCanvas.width = rotatedWidth;
          rotCanvas.height = rotatedHeight;
          const rotCtx = rotCanvas.getContext('2d');
          if (!rotCtx) throw new Error('Could not create 2D canvas context');

          rotCtx.save();
          rotCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
          rotCtx.rotate((normalizedRotation * Math.PI) / 180);
          rotCtx.drawImage(img, -originalWidth / 2, -originalHeight / 2);
          rotCtx.restore();

          // 2. Determine crop region on rotated canvas (in pixels)
          let cropX = 0;
          let cropY = 0;
          let cropW = rotatedWidth;
          let cropH = rotatedHeight;

          if (options.crop) {
            // Convert percentage values to pixel coordinates
            const pxX = Math.round((options.crop.x / 100) * rotatedWidth);
            const pxY = Math.round((options.crop.y / 100) * rotatedHeight);
            const pxW = Math.round((options.crop.width / 100) * rotatedWidth);
            const pxH = Math.round((options.crop.height / 100) * rotatedHeight);

            // Safe bounds clamping (prevent 0 or negative crops or out of bounds)
            cropX = Math.max(0, Math.min(pxX, rotatedWidth - 20));
            cropY = Math.max(0, Math.min(pxY, rotatedHeight - 20));
            cropW = Math.max(20, Math.min(pxW, rotatedWidth - cropX));
            cropH = Math.max(20, Math.min(pxH, rotatedHeight - cropY));
          }

          // 3. Create target output canvas for cropped region
          const outCanvas = document.createElement('canvas');
          outCanvas.width = cropW;
          outCanvas.height = cropH;
          const outCtx = outCanvas.getContext('2d');
          if (!outCtx) throw new Error('Could not create output canvas context');

          // Draw the cropped section
          outCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          // 4. Apply pixel-level filters (Brightness, Contrast, Document Mode, High Contrast, Blackboard)
          const imgData = outCtx.getImageData(0, 0, cropW, cropH);
          const data = imgData.data;
          const len = data.length;

          // Brightness shift (-50 to +50 -> -64 to +64)
          const bShift = (options.brightness / 50) * 64;

          // Contrast factor (-50 to +50)
          // contrast in range -100 to 100 formula: factor = (259 * (c + 255)) / (255 * (259 - c))
          const cVal = options.contrast * 1.5;
          const contrastFactor = (259 * (cVal + 255)) / (255 * (259 - cVal));

          const mode = options.filterMode;

          for (let i = 0; i < len; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // A. Base Brightness
            if (bShift !== 0) {
              r += bShift;
              g += bShift;
              b += bShift;
            }

            // B. Base Contrast
            if (options.contrast !== 0) {
              r = contrastFactor * (r - 128) + 128;
              g = contrastFactor * (g - 128) + 128;
              b = contrastFactor * (b - 128) + 128;
            }

            // C. Filter Modes
            if (mode === 'document') {
              // Grayscale luminance
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              // Clean document curve: push brights to white, dark ink to high contrast black
              let docVal = lum;
              if (lum > 140) {
                // Background paper/whiteboard whitening
                docVal = 140 + (lum - 140) * 1.6;
              } else {
                // Handwriting darkening
                docVal = lum * 0.75;
              }
              r = docVal;
              g = docVal;
              b = docVal;
            } else if (mode === 'high_contrast') {
              // Preserve color hints but sharpen dark/light separation
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              const boost = (lum - 128) * 0.4;
              r += boost;
              g += boost;
              b += boost;
            } else if (mode === 'blackboard') {
              // High-clarity chalkboard enhancement (deepen darks, pop chalk)
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum < 90) {
                r *= 0.6;
                g *= 0.6;
                b *= 0.6;
              } else {
                r = Math.min(255, r * 1.3);
                g = Math.min(255, g * 1.3);
                b = Math.min(255, b * 1.3);
              }
            }

            // Clamp 0-255
            data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
            data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
            data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
          }

          outCtx.putImageData(imgData, 0, 0);

          // 5. Output full-resolution optimized JPEG (0.88 quality for maximum formula clarity)
          const resultDataUrl = outCanvas.toDataURL('image/jpeg', 0.88);

          // 6. Generate crisp thumbnail (320px wide)
          const thumbCanvas = document.createElement('canvas');
          const thumbWidth = 320;
          const thumbHeight = Math.max(30, Math.round((cropH * thumbWidth) / cropW));
          thumbCanvas.width = thumbWidth;
          thumbCanvas.height = thumbHeight;
          const thumbCtx = thumbCanvas.getContext('2d');

          let thumbDataUrl = resultDataUrl;
          if (thumbCtx) {
            thumbCtx.drawImage(outCanvas, 0, 0, thumbWidth, thumbHeight);
            thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.75);
          }

          resolve({
            dataUrl: resultDataUrl,
            thumbnailUrl: thumbDataUrl,
            width: cropW,
            height: cropH,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image data for editing.'));
      };

      img.src = options.dataUrl;
    });
  }
  /**
   * Reads a File object and generates a study-optimized working copy and thumbnail.
   * Maintains maximum readability for whiteboard text and mathematical formulas.
   */
  static async processImageFile(file: File): Promise<ProcessedImageData> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error(`File "${file.name}" is not a supported image format.`));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          try {
            const originalWidth = img.width;
            const originalHeight = img.height;

            // 1. Generate Main Working Copy (Max 1920px width/height for sharp whiteboard readability)
            const MAX_DIMENSION = 1920;
            let targetWidth = originalWidth;
            let targetHeight = originalHeight;

            if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
              if (originalWidth > originalHeight) {
                targetWidth = MAX_DIMENSION;
                targetHeight = Math.round((originalHeight * MAX_DIMENSION) / originalWidth);
              } else {
                targetHeight = MAX_DIMENSION;
                targetWidth = Math.round((originalWidth * MAX_DIMENSION) / originalHeight);
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              resolve({
                dataUrl: rawDataUrl,
                thumbnailUrl: rawDataUrl,
                width: originalWidth,
                height: originalHeight,
                fileName: file.name,
                originalSizeBytes: file.size,
              });
              return;
            }

            // Fill clean white background in case of transparent PNG
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Compress to crisp JPEG (0.85 balance)
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

            // 2. Generate Lightweight Thumbnail (320px width)
            const thumbCanvas = document.createElement('canvas');
            const thumbWidth = 320;
            const thumbHeight = Math.round((originalHeight * thumbWidth) / originalWidth);
            thumbCanvas.width = thumbWidth;
            thumbCanvas.height = thumbHeight;
            const thumbCtx = thumbCanvas.getContext('2d');

            let thumbDataUrl = optimizedDataUrl;
            if (thumbCtx) {
              thumbCtx.fillStyle = '#ffffff';
              thumbCtx.fillRect(0, 0, thumbWidth, thumbHeight);
              thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
              thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
            }

            resolve({
              dataUrl: optimizedDataUrl,
              thumbnailUrl: thumbDataUrl,
              width: targetWidth,
              height: targetHeight,
              fileName: file.name,
              originalSizeBytes: file.size,
            });
          } catch (err) {
            console.error('Error optimizing image', err);
            // Fallback to raw data url
            resolve({
              dataUrl: rawDataUrl,
              thumbnailUrl: rawDataUrl,
              width: img.width || 1280,
              height: img.height || 720,
              fileName: file.name,
              originalSizeBytes: file.size,
            });
          }
        };

        img.onerror = () => {
          reject(new Error(`Failed to load image "${file.name}". File might be corrupted.`));
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file "${file.name}".`));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Generates realistic sample whiteboard lecture photos for testing on devices without sample files.
   */
  static generateSampleLectureNote(
    subjectName: string,
    chapterTitle: string,
    topicNumber: number,
    topicTitle: string
  ): ProcessedImageData {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Blackboard / Whiteboard simulated background
    const isDarkBoard = topicNumber % 2 === 1;

    if (isDarkBoard) {
      // Dark Slate Blackboard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1280, 800);

      // Blackboard grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 1280; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 800);
        ctx.stroke();
      }
      for (let y = 40; y < 800; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // Wooden frame border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, 1268, 788);

      // Header Tag
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`LECTURE NOTE #${topicNumber} • ${subjectName.toUpperCase()}`, 50, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`${chapterTitle} — ${topicTitle}`, 50, 110);

      // Whiteboard chalk equations
      ctx.fillStyle = '#f8fafc';
      ctx.font = '24px monospace';
      ctx.fillText('1. Standard Form:', 50, 170);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('   ax² + bx + c = 0, where a ≠ 0', 50, 215);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '24px monospace';
      ctx.fillText('2. Quadratic Formula Derivation:', 50, 275);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('   x = (-b ± √(b² - 4ac)) / (2a)', 50, 325);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '24px monospace';
      ctx.fillText('3. Nature of Roots (Discriminant D = b² - 4ac):', 50, 390);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px monospace';
      ctx.fillText('   • If D > 0 => Two real & distinct roots', 50, 435);
      ctx.fillText('   • If D = 0 => Two real & equal roots (-b/2a)', 50, 475);
      ctx.fillText('   • If D < 0 => Complex conjugate roots', 50, 515);

      // Coordinate axes diagram sketch
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(850, 650);
      ctx.lineTo(850, 220); // Y axis
      ctx.moveTo(700, 480);
      ctx.lineTo(1200, 480); // X axis
      ctx.stroke();

      // Parabola curve
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(740, 250);
      ctx.quadraticCurveTo(850, 680, 960, 250);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('y = f(x) [Vertex Min]', 880, 690);

      // Footer stamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px ui-sans-serif, system-ui';
      ctx.fillText(`Easy Study Snap • Captured from Classroom Whiteboard • ${new Date().toLocaleDateString()}`, 50, 755);

    } else {
      // Clean White Marker Board
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1280, 800);

      // Marker Board silver frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 1266, 786);

      // Header Tag
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 22px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`BOARD SNAPSHOT #${topicNumber} • ${subjectName.toUpperCase()}`, 50, 60);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 32px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(`${chapterTitle}: ${topicTitle}`, 50, 110);

      // Blue & Red dry-erase marker notes
      ctx.fillStyle = '#1e293b';
      ctx.font = '24px monospace';
      ctx.fillText('Step-by-Step Example Solution:', 50, 170);

      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('Solve: 2x² - 7x + 3 = 0', 50, 215);

      ctx.fillStyle = '#0f172a';
      ctx.font = '22px monospace';
      ctx.fillText('Step 1: Identify coefficients -> a = 2, b = -7, c = 3', 50, 275);
      ctx.fillText('Step 2: Calculate Discriminant: D = (-7)² - 4(2)(3)', 50, 320);
      ctx.fillText('        D = 49 - 24 = 25 (> 0, Perfect Square)', 50, 360);

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('Step 3: x = (7 ± √25) / (2 * 2) = (7 ± 5) / 4', 50, 420);
      ctx.fillText('        => x₁ = 12/4 = 3', 50, 465);
      ctx.fillText('        => x₂ = 2/4  = 1/2', 50, 505);

      // Key Takeaway box
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(50, 560, 1180, 140);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 560, 1180, 140);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 20px ui-sans-serif, system-ui';
      ctx.fillText('IMPORTANT EXAM TIP:', 70, 595);
      ctx.font = '18px ui-sans-serif, system-ui';
      ctx.fillText('Always check roots in the original equation to eliminate extraneous solutions.', 70, 635);
      ctx.fillText('Sum of roots = -b/a = 7/2. Product of roots = c/a = 3/2. (Matches 3 + 1/2 = 7/2)', 70, 670);

      // Footer stamp
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px ui-sans-serif, system-ui';
      ctx.fillText(`Easy Study Snap • Gallery Import • ${new Date().toLocaleDateString()}`, 50, 755);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    // Thumbnail
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 320;
    thumbCanvas.height = 200;
    const thumbCtx = thumbCanvas.getContext('2d')!;
    thumbCtx.drawImage(canvas, 0, 0, 320, 200);
    const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    return {
      dataUrl,
      thumbnailUrl: thumbDataUrl,
      width: 1280,
      height: 800,
      fileName: `Board_${topicTitle.replace(/\s+/g, '_')}.jpg`,
      originalSizeBytes: 420000,
    };
  }
}
