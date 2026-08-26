/**
 * Easy Study Snap - Photo Editor & Readability Suite
 * Phase 8: Photo Editing, Crop, Rotate, Brightness, Contrast & Document Mode
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BoardPhoto, Chapter, Subject } from '../../types';
import { ImageOptimizer, ImageEditOptions, ImageCropRect } from '../../utils/imageOptimizer';
import { Button } from '../common/Button';
import {
  X,
  Undo2,
  RotateCcw,
  RotateCw,
  Crop as CropIcon,
  Sliders,
  Sun,
  Contrast as ContrastIcon,
  FileText,
  Sparkles,
  Check,
  AlertTriangle,
  Save,
  Layers,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Eye,
} from 'lucide-react';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: BoardPhoto | null;
  chapter: Chapter;
  subject: Subject;
  onSavePhoto: (updatedPhoto: BoardPhoto) => Promise<void>;
  onRestoreOriginal?: (photo: BoardPhoto) => Promise<void>;
}

interface EditorState {
  rotation: number; // 0, 90, 180, 270
  brightness: number; // -50 to +50
  contrast: number; // -50 to +50
  filterMode: 'normal' | 'document' | 'high_contrast' | 'blackboard';
  crop: ImageCropRect;
}

const DEFAULT_CROP: ImageCropRect = { x: 0, y: 0, width: 100, height: 100 };

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  photo,
  chapter,
  subject,
  onSavePhoto,
  onRestoreOriginal,
}) => {
  // Editor Working State
  const [currentState, setCurrentState] = useState<EditorState>(() => ({
    rotation: photo?.rotation || 0,
    brightness: photo?.brightness || 0,
    contrast: photo?.contrast || 0,
    filterMode: photo?.filterMode || 'normal',
    crop: { ...DEFAULT_CROP },
  }));

  // Initial reference to detect unsaved changes
  const [initialSnapshot, setInitialSnapshot] = useState<EditorState>(() => ({
    rotation: photo?.rotation || 0,
    brightness: photo?.brightness || 0,
    contrast: photo?.contrast || 0,
    filterMode: photo?.filterMode || 'normal',
    crop: { ...DEFAULT_CROP },
  }));

  // Bounded Undo History Stack (Max 10 steps)
  const [history, setHistory] = useState<EditorState[]>([]);
  const MAX_HISTORY_LIMIT = 10;

  // UI tabs & tools
  const [activeTab, setActiveTab] = useState<'adjust' | 'crop_rotate' | 'filters'>('adjust');
  const [isCropActive, setIsCropActive] = useState(false);
  const [tempCrop, setTempCrop] = useState<ImageCropRect>({ ...DEFAULT_CROP });

  // Processing & Confirmation Dialogs
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Synchronize state when opened with a new photo
  useEffect(() => {
    if (photo && isOpen) {
      const initial: EditorState = {
        rotation: photo.rotation || 0,
        brightness: photo.brightness || 0,
        contrast: photo.contrast || 0,
        filterMode: photo.filterMode || 'normal',
        crop: { ...DEFAULT_CROP },
      };
      setCurrentState(initial);
      setInitialSnapshot(initial);
      setTempCrop({ ...DEFAULT_CROP });
      setHistory([]);
      setIsCropActive(false);
      setErrorMessage(null);
    }
  }, [photo, isOpen]);

  if (!isOpen || !photo) return null;

  // Base image to edit from (if originalDataUrl exists, we use it for fresh edits, otherwise localDataUrl)
  const sourceImage = photo.originalDataUrl || photo.localDataUrl;

  // Check if state has unsaved changes compared to snapshot
  const hasUnsavedChanges =
    currentState.rotation !== initialSnapshot.rotation ||
    currentState.brightness !== initialSnapshot.brightness ||
    currentState.contrast !== initialSnapshot.contrast ||
    currentState.filterMode !== initialSnapshot.filterMode ||
    currentState.crop.x !== initialSnapshot.crop.x ||
    currentState.crop.y !== initialSnapshot.crop.y ||
    currentState.crop.width !== initialSnapshot.crop.width ||
    currentState.crop.height !== initialSnapshot.crop.height;

  // Helper to push state changes to undo stack
  const updateStateWithHistory = (updater: (prev: EditorState) => EditorState) => {
    setCurrentState((prev) => {
      const next = updater(prev);
      setHistory((prevHistory) => [...prevHistory.slice(-MAX_HISTORY_LIMIT + 1), prev]);
      return next;
    });
  };

  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentState(previousState);
    if (isCropActive) {
      setTempCrop(previousState.crop);
    }
  };

  // Reset to initial session state
  const handleReset = () => {
    updateStateWithHistory(() => ({ ...initialSnapshot }));
    setTempCrop({ ...initialSnapshot.crop });
    setIsCropActive(false);
  };

  // Rotation Controls
  const handleRotateCW = () => {
    updateStateWithHistory((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleRotateCCW = () => {
    updateStateWithHistory((prev) => ({
      ...prev,
      rotation: (prev.rotation - 90 + 360) % 360,
    }));
  };

  // Brightness change
  const handleBrightnessChange = (val: number) => {
    // Clamp to -50 to +50
    const clamped = Math.max(-50, Math.min(50, val));
    setCurrentState((prev) => ({ ...prev, brightness: clamped }));
  };

  const handleBrightnessCommit = () => {
    // Record history snapshot when slider release occurs
    setHistory((prevHistory) => [
      ...prevHistory.slice(-MAX_HISTORY_LIMIT + 1),
      { ...currentState },
    ]);
  };

  // Contrast change
  const handleContrastChange = (val: number) => {
    const clamped = Math.max(-50, Math.min(50, val));
    setCurrentState((prev) => ({ ...prev, contrast: clamped }));
  };

  const handleContrastCommit = () => {
    setHistory((prevHistory) => [
      ...prevHistory.slice(-MAX_HISTORY_LIMIT + 1),
      { ...currentState },
    ]);
  };

  // Filter Mode toggle
  const handleFilterModeChange = (mode: EditorState['filterMode']) => {
    updateStateWithHistory((prev) => ({
      ...prev,
      filterMode: mode,
    }));
  };

  // Crop Controls
  const handleStartCrop = () => {
    setTempCrop({ ...currentState.crop });
    setIsCropActive(true);
  };

  const handleApplyCrop = () => {
    updateStateWithHistory((prev) => ({
      ...prev,
      crop: { ...tempCrop },
    }));
    setIsCropActive(false);
  };

  const handleCancelCrop = () => {
    setTempCrop({ ...currentState.crop });
    setIsCropActive(false);
  };

  // Safe Exit Handling
  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Save changes to Photo Storage & Chapter
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Process full-fidelity canvas transformation
      const editOptions: ImageEditOptions = {
        dataUrl: sourceImage,
        rotation: currentState.rotation,
        brightness: currentState.brightness,
        contrast: currentState.contrast,
        filterMode: currentState.filterMode,
        crop:
          currentState.crop.width < 100 ||
          currentState.crop.height < 100 ||
          currentState.crop.x > 0 ||
          currentState.crop.y > 0
            ? currentState.crop
            : undefined,
      };

      const result = await ImageOptimizer.applyImageEdits(editOptions);

      // 2. Prepare updated BoardPhoto object preserving all metadata and storing originalDataUrl
      const updatedPhoto: BoardPhoto = {
        ...photo,
        localDataUrl: result.dataUrl,
        thumbnailUrl: result.thumbnailUrl,
        originalDataUrl: photo.originalDataUrl || photo.localDataUrl, // Safeguard original copy!
        width: result.width,
        height: result.height,
        rotation: currentState.rotation,
        brightness: currentState.brightness,
        contrast: currentState.contrast,
        filterMode: currentState.filterMode,
        updatedAt: Date.now(),
      };

      await onSavePhoto(updatedPhoto);
      onClose();
    } catch (err) {
      console.error('Failed to save edited photo', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to process image edits. Please try again with smaller crop area.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Restore to original captured unedited photo
  const handleRestoreOriginal = async () => {
    if (!photo.originalDataUrl) {
      // Already at original, just reset sliders
      handleReset();
      setShowRestoreConfirm(false);
      return;
    }

    setIsSaving(true);
    try {
      // Revert to original data URL with default settings
      const restoredPhoto: BoardPhoto = {
        ...photo,
        localDataUrl: photo.originalDataUrl,
        thumbnailUrl: undefined, // Will be recomputed or loaded cleanly
        rotation: 0,
        brightness: 0,
        contrast: 0,
        filterMode: 'normal',
        updatedAt: Date.now(),
      };

      if (onRestoreOriginal) {
        await onRestoreOriginal(restoredPhoto);
      } else {
        await onSavePhoto(restoredPhoto);
      }

      setShowRestoreConfirm(false);
      onClose();
    } catch (err) {
      console.error('Error restoring original', err);
      setErrorMessage('Failed to restore original image.');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute CSS filter string for ultra-smooth real-time interactive preview
  const getPreviewFilterStyle = (): string => {
    const brightnessPct = 100 + currentState.brightness * 1.2;
    const contrastPct = 100 + currentState.contrast * 1.5;

    let filterStr = `brightness(${brightnessPct}%) contrast(${contrastPct}%)`;

    if (currentState.filterMode === 'document') {
      filterStr += ' grayscale(100%) contrast(140%) brightness(105%)';
    } else if (currentState.filterMode === 'high_contrast') {
      filterStr += ' contrast(160%)';
    } else if (currentState.filterMode === 'blackboard') {
      filterStr += ' contrast(150%) brightness(95%)';
    }

    return filterStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md transition-opacity duration-200 select-none p-2 sm:p-4">
      <div
        id="photo-editor-modal"
        className="w-full max-w-5xl h-[94vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-modal-enter"
      >
        {/* Top Header Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
          {/* Back & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              id="editor-back-btn"
              onClick={handleRequestClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close / Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Photo Editor
                </span>
                {hasUnsavedChanges && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    Unsaved Edits
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {subject.name} • Ch. {chapter.chapterNumber}: {chapter.title}
              </p>
            </div>
          </div>

          {/* Action Toolbar: Undo, Reset, Restore, Save */}
          <div className="flex items-center gap-2">
            {/* Undo Action */}
            <button
              type="button"
              id="editor-undo-btn"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title={`Undo (${history.length} available)`}
            >
              <Undo2 className="w-5 h-5" />
            </button>

            {/* Reset Current Session */}
            <button
              type="button"
              id="editor-reset-btn"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Reset Session Changes"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Restore Original File (if edited previously) */}
            {(photo.originalDataUrl || photo.rotation !== 0 || photo.filterMode !== 'normal') && (
              <button
                type="button"
                id="editor-restore-original-btn"
                onClick={() => setShowRestoreConfirm(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
                title="Restore to original unedited photo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restore Original
              </button>
            )}

            {/* Save Button */}
            <Button
              id="editor-save-btn"
              variant="primary"
              size="sm"
              icon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
            >
              {isSaving ? 'Processing...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-rose-950/90 border-b border-rose-800 text-xs text-rose-200 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {errorMessage}
            </span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-300 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Canvas / Image Preview Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center p-4 sm:p-8">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {/* Display Image with Live CSS Rotation & Readability Filter Preview */}
            <div
              className="relative overflow-hidden rounded-xl shadow-2xl transition-all duration-150"
              style={{
                transform: `rotate(${currentState.rotation}deg)`,
                filter: getPreviewFilterStyle(),
              }}
            >
              <img
                src={sourceImage}
                alt="Board Note Editing Preview"
                className="max-h-[58vh] sm:max-h-[64vh] max-w-full object-contain pointer-events-none rounded-lg"
              />

              {/* Crop Boundary Indicator when Crop is Active */}
              {isCropActive && (
                <div
                  className="absolute border-2 border-indigo-400 bg-indigo-500/15 backdrop-blur-[1px] pointer-events-none transition-all"
                  style={{
                    left: `${tempCrop.x}%`,
                    top: `${tempCrop.y}%`,
                    width: `${tempCrop.width}%`,
                    height: `${tempCrop.height}%`,
                  }}
                >
                  {/* Grid Lines (Rule of Thirds) */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  {/* Corner Accent Grips */}
                  <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow" />
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow" />
                </div>
              )}
            </div>
          </div>

          {/* Active Mode Quick Status Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {currentState.filterMode === 'document'
                  ? 'Document Mode (Clean B&W)'
                  : currentState.filterMode === 'high_contrast'
                  ? 'High Contrast'
                  : currentState.filterMode === 'blackboard'
                  ? 'Blackboard Clarity'
                  : 'Standard Filter'}
              </span>
              {currentState.rotation !== 0 && <span>• {currentState.rotation}°</span>}
            </span>
          </div>

          {/* Crop Control Floating Bar when Crop Mode is Active */}
          {isCropActive && (
            <div className="absolute bottom-4 inset-x-4 max-w-lg mx-auto z-20 p-3 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 text-xs">
                <CropIcon className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">Adjust Crop Margins:</span>
              </div>

              {/* Crop Margin Sliders (Left/Right & Top/Bottom Insets) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTempCrop({ x: 5, y: 5, width: 90, height: 90 })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                >
                  Trim 5% Borders
                </button>
                <button
                  type="button"
                  onClick={() => setTempCrop({ x: 10, y: 10, width: 80, height: 80 })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                >
                  Trim 10%
                </button>
                <button
                  type="button"
                  onClick={() => setTempCrop({ ...DEFAULT_CROP })}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300"
                >
                  Full Board
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCrop}
                  className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-3.5 h-3.5" />}
                  onClick={handleApplyCrop}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500"
                >
                  Apply Crop
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Editing Control Deck */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              id="tab-adjust-btn"
              onClick={() => setActiveTab('adjust')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'adjust'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Adjust (Brightness & Contrast)
            </button>

            <button
              type="button"
              id="tab-crop-rotate-btn"
              onClick={() => setActiveTab('crop_rotate')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'crop_rotate'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              Rotate & Crop
            </button>

            <button
              type="button"
              id="tab-filters-btn"
              onClick={() => setActiveTab('filters')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'filters'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Readability Modes
            </button>
          </div>

          {/* Active Tab Panel 1: Adjust Sliders */}
          {activeTab === 'adjust' && (
            <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Brightness Control */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    Brightness
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {currentState.brightness > 0 ? `+${currentState.brightness}` : currentState.brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  id="brightness-slider"
                  min="-50"
                  max="50"
                  step="1"
                  value={currentState.brightness}
                  onChange={(e) => handleBrightnessChange(Number(e.target.value))}
                  onMouseUp={handleBrightnessCommit}
                  onTouchEnd={handleBrightnessCommit}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-50% (Darker)</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleBrightnessChange(0);
                      handleBrightnessCommit();
                    }}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Reset (0%)
                  </button>
                  <span>+50% (Brighter)</span>
                </div>
              </div>

              {/* Contrast Control */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ContrastIcon className="w-4 h-4 text-sky-400" />
                    Contrast
                  </span>
                  <span className="font-mono text-indigo-400 font-bold">
                    {currentState.contrast > 0 ? `+${currentState.contrast}` : currentState.contrast}%
                  </span>
                </div>
                <input
                  type="range"
                  id="contrast-slider"
                  min="-50"
                  max="50"
                  step="1"
                  value={currentState.contrast}
                  onChange={(e) => handleContrastChange(Number(e.target.value))}
                  onMouseUp={handleContrastCommit}
                  onTouchEnd={handleContrastCommit}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>-50% (Soft)</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleContrastChange(0);
                      handleContrastCommit();
                    }}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Reset (0%)
                  </button>
                  <span>+50% (Crisp Text)</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Tab Panel 2: Rotate & Crop Tools */}
          {activeTab === 'crop_rotate' && (
            <div className="max-w-xl mx-auto flex items-center justify-center gap-3 pt-1 flex-wrap">
              {/* Rotate Left 90° */}
              <button
                type="button"
                id="rotate-ccw-btn"
                onClick={handleRotateCCW}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:border-indigo-500/50"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                Rotate 90° Left
              </button>

              {/* Rotate Right 90° */}
              <button
                type="button"
                id="rotate-cw-btn"
                onClick={handleRotateCW}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all hover:border-indigo-500/50"
              >
                <RotateCw className="w-4 h-4 text-indigo-400" />
                Rotate 90° Right
              </button>

              {/* Interactive Crop Launcher */}
              <button
                type="button"
                id="start-crop-btn"
                onClick={handleStartCrop}
                className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  isCropActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200 hover:border-indigo-500/50'
                }`}
              >
                <CropIcon className="w-4 h-4 text-indigo-400" />
                {isCropActive ? 'Adjusting Crop...' : 'Crop Classroom Borders'}
              </button>
            </div>
          )}

          {/* Active Tab Panel 3: Document & Readability Modes */}
          {activeTab === 'filters' && (
            <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Option 1: Normal */}
              <button
                type="button"
                onClick={() => handleFilterModeChange('normal')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentState.filterMode === 'normal'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold block text-white">Original Color</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Natural classroom look
                </span>
              </button>

              {/* Option 2: Document / Clean B&W */}
              <button
                type="button"
                onClick={() => handleFilterModeChange('document')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentState.filterMode === 'document'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold block text-indigo-300 flex items-center justify-between">
                  <span>Document B&W</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Whiten board, crisp ink
                </span>
              </button>

              {/* Option 3: High Contrast */}
              <button
                type="button"
                onClick={() => handleFilterModeChange('high_contrast')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentState.filterMode === 'high_contrast'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold block text-white">High Contrast</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sharpen faded marker
                </span>
              </button>

              {/* Option 4: Blackboard Mode */}
              <button
                type="button"
                onClick={() => handleFilterModeChange('blackboard')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentState.filterMode === 'blackboard'
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold block text-white">Blackboard</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Chalk boost & dark slate
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Discard Confirmation Dialog */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Discard Unsaved Changes?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  You have made adjustments that have not been saved.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you leave now, your current editing adjustments will be cancelled and the stored photograph will remain completely untouched.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDiscardConfirm(false)}
                className="text-xs"
              >
                Keep Editing
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="text-xs bg-rose-600 hover:bg-rose-500"
              >
                Discard & Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Original Confirmation Dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Original Photograph?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Revert all previous edits, rotations, and crops.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore the photograph to its original state as captured or imported. The photo will remain in its current chapter with all its associations intact.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowRestoreConfirm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleRestoreOriginal}
                disabled={isSaving}
                className="text-xs bg-rose-600 hover:bg-rose-500"
              >
                {isSaving ? 'Restoring...' : 'Yes, Restore Original'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
