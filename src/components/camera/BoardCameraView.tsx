import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chapter, Subject, AcademicField, BoardPhoto, UserProfile } from '../../types';
import { PhotoStorageService } from '../../services/photoStorage';
import { cameraSound } from '../../services/cameraSound';
import {
  Camera,
  X,
  RefreshCw,
  Zap,
  ZapOff,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface BoardCameraViewProps {
  user: UserProfile;
  chapter: Chapter;
  subject: Subject;
  field: AcademicField | null;
  onClose: () => void;
  onPhotoCaptured: (photo: BoardPhoto) => void;
}

export const BoardCameraView: React.FC<BoardCameraViewProps> = ({
  user,
  chapter,
  subject,
  field,
  onClose,
  onPhotoCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera State
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unavailable' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Capture State
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastCapturedThumb, setLastCapturedThumb] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [initialCount, setInitialCount] = useState<number>(0);

  // Fetch initial chapter photo count for correct sequencing
  useEffect(() => {
    let isMounted = true;
    PhotoStorageService.getChapterPhotoCount(user.id, chapter.id).then((count) => {
      if (isMounted) {
        setInitialCount(count);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user.id, chapter.id]);

  // Stop active media stream helper
  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize and start camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setPermissionState('loading');
    setErrorMessage(null);
    stopMediaStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('unavailable');
      setErrorMessage('Your browser or device does not support direct camera video access.');
      return;
    }

    try {
      // Check available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

      // Constraints: ideal 1080p rear camera
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setPermissionState('granted');

      // Check for torch/flashlight capability on video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && 'getCapabilities' in videoTrack) {
        const capabilities = (videoTrack as any).getCapabilities?.();
        if (capabilities && 'torch' in capabilities) {
          setTorchAvailable(true);
        } else {
          setTorchAvailable(false);
        }
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or phone settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('unavailable');
        setErrorMessage('No camera device found on this system. You can test using the Board Photo Simulator.');
      } else {
        setPermissionState('unavailable');
        setErrorMessage(err.message || 'Unable to access camera hardware.');
      }
    }
  }, [stopMediaStream]);

  // Start camera on mount or facingMode change
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopMediaStream();
    };
  }, [facingMode, startCamera, stopMediaStream]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current || !torchAvailable) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchEnabled;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchEnabled(nextTorch);
    } catch (err) {
      console.error('Torch toggle failed', err);
    }
  };

  // Switch between Front & Rear Camera
  const switchCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Generate a fallback blackboard/whiteboard demo frame for testing when hardware webcam is absent
  const generateSimulatedBoardCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Blackboard style gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chalk border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Classroom Lecture Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${subject.name.toUpperCase()} • CHAPTER ${chapter.chapterNumber}`, 50, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(chapter.title, 50, 140);

    // Simulated handwritten notes and formulas
    ctx.fillStyle = '#f8fafc';
    ctx.font = '28px monospace';
    const notes = [
      `Section 1.${initialCount + sessionCount + 1}: Classroom Board Snapshot`,
      `Formula: f(x) = ax² + bx + c = 0`,
      `Quadratic Root: x = (-b ± √(b² - 4ac)) / (2a)`,
      `Discriminant Analysis: Δ = b² - 4ac > 0 (Real & Distinct Roots)`,
      `Timestamp: ${new Date().toLocaleTimeString()} (Class Lecture Note)`,
    ];
    notes.forEach((line, idx) => {
      ctx.fillText(line, 50, 230 + idx * 60);
    });

    // Student watermarking
    ctx.fillStyle = '#64748b';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Easy Study Snap • ${user.name} • Photo #${initialCount + sessionCount + 1}`, 50, 660);

    return canvas;
  };

  /**
   * Main Capture Logic:
   * Instant non-blocking capture -> optimize JPEG -> IndexedDB persist -> resume video stream
   */
  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setSaveError(null);

    // Trigger visual flash and audio feedback immediately
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 120);
    cameraSound.playShutterSound();

    try {
      let canvas: HTMLCanvasElement;
      let width = 1280;
      let height = 720;

      if (videoRef.current && permissionState === 'granted' && videoRef.current.videoWidth > 0) {
        width = videoRef.current.videoWidth;
        height = videoRef.current.videoHeight;
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');

        // If user camera, mirror it horizontally
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else {
        // Fallback simulated board snapshot
        canvas = generateSimulatedBoardCanvas();
        width = canvas.width;
        height = canvas.height;
      }

      // Quality: 0.85 JPEG provides crisp whiteboard text readability while keeping file size ~200-400KB
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Create smaller thumbnail for fast loading in grid
      const thumbCanvas = document.createElement('canvas');
      const thumbWidth = 320;
      const thumbHeight = Math.round((height / width) * 320);
      thumbCanvas.width = thumbWidth;
      thumbCanvas.height = thumbHeight;
      const thumbCtx = thumbCanvas.getContext('2d');
      if (thumbCtx) {
        thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
      }
      const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

      const nextOrderIndex = initialCount + sessionCount + 1;
      const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const newPhoto: BoardPhoto = {
        id: photoId,
        userId: user.id,
        chapterId: chapter.id,
        orderIndex: nextOrderIndex,
        localDataUrl: dataUrl,
        thumbnailUrl: thumbDataUrl,
        width,
        height,
        rotation: 0,
        filterMode: 'normal',
        syncStatus: 'pending',
        createdAt: Date.now(),
        isDeleted: false,
      };

      // Persist to offline IndexedDB
      await PhotoStorageService.savePhoto(newPhoto);

      // Update session statistics
      setSessionCount((prev) => prev + 1);
      setLastCapturedThumb(thumbDataUrl);

      // Notify parent to update chapter/subject counters immediately
      onPhotoCaptured(newPhoto);
    } catch (err: any) {
      console.error('Photo capture/save error', err);
      setSaveError('Unable to save this photo. Please check your storage and try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden font-sans">
      {/* Visual Shutter Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white/70 pointer-events-none transition-opacity duration-150 animate-pulse" />
      )}

      {/* Top Navigation & Chapter Header HUD */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
        <button
          type="button"
          id="close-board-camera-btn"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide text-white border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Camera</span>
        </button>

        {/* Bound Chapter Context Pill */}
        <div className="flex flex-col items-center text-center px-2 max-w-[60%] sm:max-w-[70%] truncate">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-300 font-semibold truncate">
            <GraduationCap className="w-3 h-3 shrink-0" />
            <span className="truncate">{subject.name}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-white truncate">
            Ch. {chapter.chapterNumber}: {chapter.title}
          </div>
        </div>

        {/* Top Camera Controls (Torch / Camera Switch) */}
        <div className="flex items-center gap-2">
          {torchAvailable && permissionState === 'granted' && (
            <button
              type="button"
              id="camera-torch-toggle-btn"
              onClick={toggleTorch}
              className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                torchEnabled
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
              }`}
              title="Toggle Flashlight / Torch"
            >
              {torchEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          {hasMultipleCameras && permissionState === 'granted' && (
            <button
              type="button"
              id="camera-switch-facing-btn"
              onClick={switchCamera}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-colors"
              title="Switch Front/Rear Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Save Error Alert Banner */}
      {saveError && (
        <div className="relative z-30 mx-4 my-2 p-3 rounded-xl bg-rose-500/90 text-white text-xs flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="p-1 hover:bg-white/20 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Viewfinder Canvas / Video Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${
            permissionState === 'granted' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Viewfinder Rule-of-Thirds Grid / Board Frame */}
        {permissionState === 'granted' && (
          <div className="absolute inset-6 sm:inset-10 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between text-[10px] text-white/50 uppercase tracking-widest font-mono">
              <span>Classroom Board Mode</span>
              <span>1080p RAW</span>
            </div>
            {/* Center Focus Reticle */}
            <div className="self-center w-12 h-12 border border-white/30 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-400/80 rounded-full" />
            </div>
            <div className="text-center text-[10px] text-white/50 tracking-wider">
              Align whiteboard edges inside frame
            </div>
          </div>
        )}

        {/* Loading Camera State */}
        {permissionState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-slate-950/80 px-4">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-300">Initializing classroom camera...</p>
          </div>
        )}

        {/* Permission Denied or Unavailable State */}
        {(permissionState === 'denied' || permissionState === 'unavailable') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                {permissionState === 'denied' ? 'Camera Permission Required' : 'Camera Hardware Unavailable'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {errorMessage ||
                  'Camera access is needed to capture your classroom whiteboard notes. Enable camera permission in your browser or phone settings.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                type="button"
                id="retry-camera-btn"
                onClick={() => startCamera(facingMode)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>

              <button
                type="button"
                id="simulate-board-capture-btn"
                onClick={handleCapture}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Capture Test Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Capture Controls Bar */}
      <footer className="relative z-30 px-6 py-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between">
        {/* Left: Recent Thumbnail Preview & Session Counter */}
        <div className="flex items-center gap-3 w-28">
          {lastCapturedThumb ? (
            <div className="relative group">
              <img
                src={lastCapturedThumb}
                alt="Recent snapshot"
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md bg-slate-800"
              />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow">
                <Check className="w-3 h-3" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}

          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] font-bold text-white">
              {initialCount + sessionCount} {initialCount + sessionCount === 1 ? 'Photo' : 'Photos'}
            </span>
            <span className="text-[10px] text-slate-400">In this chapter</span>
          </div>
        </div>

        {/* Center: Large Shutter Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            id="shutter-capture-board-btn"
            onClick={handleCapture}
            disabled={isCapturing}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-white p-1 focus:outline-none focus:ring-4 focus:ring-indigo-400 active:scale-95 transition-transform"
            aria-label="Capture Board Photograph"
          >
            {/* Inner Shutter Solid Circle */}
            <div className="w-full h-full rounded-full bg-white group-hover:bg-indigo-100 group-active:scale-90 transition-all flex items-center justify-center shadow-inner">
              <Camera className="w-7 h-7 text-slate-900 group-hover:text-indigo-600 transition-colors" />
            </div>
          </button>
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            Tap to Capture
          </span>
        </div>

        {/* Right: Session Saved Counter & Done Button */}
        <div className="w-28 flex flex-col items-end gap-1.5">
          <button
            type="button"
            id="done-capturing-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-colors flex items-center gap-1"
          >
            <span>Done</span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-800 text-[10px]">
              {sessionCount}
            </span>
          </button>
          {sessionCount > 0 && (
            <span className="text-[9px] text-emerald-400 font-medium text-right">
              ✓ +{sessionCount} new saved
            </span>
          )}
        </div>
      </footer>
    </div>
  );
};
