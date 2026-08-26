import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, AcademicField } from '../../types';
import {
  ArrowLeft,
  Camera,
  User,
  ChevronDown,
  Upload,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface ProfileSetupScreenProps {
  user: UserProfile;
  fields?: AcademicField[];
  onBack?: () => void;
  onCompleteSetup: (data: {
    name: string;
    fatherName: string;
    rollNumber?: string;
    avatarUrl?: string;
    selectedFieldId: string;
    fieldOfStudy: string;
    customFieldName?: string;
    customSubjects?: string[];
  }) => Promise<void>;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  user,
  fields = [],
  onBack,
  onCompleteSetup,
}) => {
  // Form State
  const [name, setName] = useState(user.name || '');
  const [fatherName, setFatherName] = useState(user.fatherName || '');
  const [rollNumber, setRollNumber] = useState(user.rollNumber || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);
  const [selectedFieldId, setSelectedFieldId] = useState(user.selectedFieldId || (fields.length > 0 ? fields[0].id : 'field_pre_eng'));
  const [customFieldName, setCustomFieldName] = useState('');

  // Photo Action Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Validation & Saving State
  const [errors, setErrors] = useState<{
    name?: string;
    fatherName?: string;
    field?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Handle Photo Selection via Gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setIsPhotoModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Live Camera for Photo
  const handleStartCamera = async () => {
    try {
      setIsCapturingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      alert('Unable to access camera. Please choose from gallery instead.');
      setIsCapturingCamera(false);
    }
  };

  // Capture Photo from Live Video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Crop square center
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      const startX = (videoRef.current.videoWidth - size) / 2;
      const startY = (videoRef.current.videoHeight - size) / 2;
      ctx.drawImage(videoRef.current, startX, startY, size, size, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setAvatarUrl(dataUrl);
    }
    handleStopCamera();
    setIsPhotoModalOpen(false);
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
    setIsPhotoModalOpen(false);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!fatherName.trim()) {
      newErrors.fatherName = "Please enter your father's name.";
    }

    if (!selectedFieldId) {
      newErrors.field = 'Please select an academic field.';
    } else if (selectedFieldId === 'field_custom' && !customFieldName.trim()) {
      newErrors.field = 'Please enter your custom field name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSaving) return;

    try {
      setIsSaving(true);
      const chosenField = selectedFieldId === 'field_custom' 
        ? { id: 'field_custom', name: customFieldName.trim() }
        : fields.find(f => f.id === selectedFieldId) || { id: selectedFieldId, name: 'Custom Field' };

      await onCompleteSetup({
        name: name.trim(),
        fatherName: fatherName.trim(),
        rollNumber: rollNumber.trim() || undefined,
        avatarUrl,
        selectedFieldId: chosenField.id,
        fieldOfStudy: chosenField.name,
        customFieldName: selectedFieldId === 'field_custom' ? customFieldName.trim() : undefined,
      });
    } catch (err) {
      console.error('Failed to complete profile setup', err);
      alert('Unable to save profile right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100/60 via-purple-100/60 to-blue-100/60 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900 text-slate-900 flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 select-none overflow-x-hidden relative">
      {/* Background Soft Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-400/10 dark:bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Top Header Bar with Back Button */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between z-20">
        {onBack && (
          <motion.button
            id="btn-profile-setup-back"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            type="button"
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 active:scale-95 transition-all cursor-pointer"
            title="Back to Sign-In"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
          </motion.button>
        )}
        <div className="flex-1" />
      </div>

      {/* Hidden File Input for Gallery Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col items-center z-10 text-center">
        {/* 1. Page Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-1"
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] leading-tight">
            Set Up Your Profile
          </h1>
          <p className="text-xs sm:text-sm font-normal text-slate-500">
            Let's personalize your study space.
          </p>
        </motion.div>

        {/* 2. Circular Profile Photo / Avatar Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="my-5 sm:my-6 relative flex items-center justify-center"
        >
          <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-slate-100 border-2 border-white shadow-md shadow-slate-200/80 overflow-hidden flex items-center justify-center relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Student Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-indigo-100/70 flex items-center justify-center text-slate-400">
                <User className="w-12 h-12 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Camera Button Overlapping Lower-Right */}
          <button
            id="btn-profile-photo-action"
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-md shadow-blue-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white"
            title="Add / Change Profile Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </motion.div>

        {/* 3. Clean Compact Profile Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full space-y-3.5 text-left p-6 sm:p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-white/60 dark:border-slate-800/60"
        >
          {/* Field 1: Your Name * */}
          <div className="space-y-1">
            <label
              htmlFor="profile-name"
              className="block text-xs font-semibold text-slate-700"
            >
              Your Name <span className="text-blue-600 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Baitullah Mohmand"
                className={`w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none transition-all ${
                  errors.name
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/50'
                    : 'border-slate-200/90 dark:border-slate-700/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100/50'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Field 2: Father's Name * */}
          <div className="space-y-1">
            <label
              htmlFor="profile-father-name"
              className="block text-xs font-semibold text-slate-700"
            >
              Father's Name <span className="text-blue-600 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                id="profile-father-name"
                type="text"
                value={fatherName}
                onChange={(e) => {
                  setFatherName(e.target.value);
                  if (errors.fatherName)
                    setErrors((prev) => ({ ...prev, fatherName: undefined }));
                }}
                placeholder="e.g. Mohmand Khan"
                className={`w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none transition-all ${
                  errors.fatherName
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/50'
                    : 'border-slate-200/90 dark:border-slate-700/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100/50'
                }`}
              />
            </div>
            {errors.fatherName && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fatherName}</span>
              </p>
            )}
          </div>

          {/* Field 3: Academic Field * */}
          <div className="space-y-1">
            <label
              htmlFor="profile-field-select"
              className="block text-xs font-semibold text-slate-700"
            >
              Academic Field <span className="text-blue-600 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                id="profile-field-select"
                value={selectedFieldId}
                onChange={(e) => {
                  setSelectedFieldId(e.target.value);
                  if (errors.field) setErrors((prev) => ({ ...prev, field: undefined }));
                }}
                className={`w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border text-slate-900 dark:text-white shadow-xs focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100/50 transition-all appearance-none cursor-pointer pr-10 ${
                  errors.field
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/50'
                    : 'border-slate-200/90 dark:border-slate-700/90'
                }`}
              >
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
                <option value="custom">Custom (Add your own)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* Custom Field Name Input */}
            {selectedFieldId === 'field_custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                className="relative"
              >
                <input
                  type="text"
                  value={customFieldName}
                  onChange={(e) => {
                    setCustomFieldName(e.target.value);
                    if (errors.field) setErrors((prev) => ({ ...prev, field: undefined }));
                  }}
                  placeholder="Enter your field name..."
                  className={`w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none transition-all ${
                    errors.field
                      ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/50'
                      : 'border-slate-200/90 dark:border-slate-700/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100/50'
                  }`}
                />
              </motion.div>
            )}

            {errors.field && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.field}</span>
              </p>
            )}
          </div>

          {/* Field 5: Roll Number (Optional) */}
          <div className="space-y-1">
            <label
              htmlFor="profile-roll-number"
              className="block text-xs font-semibold text-slate-700"
            >
              Roll Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="profile-roll-number"
              type="text"
              inputMode="numeric"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 1042"
              className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/90 text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100/50 transition-all"
            />
          </div>

          {/* 4. Continue Button */}
          <div className="pt-3 sm:pt-4">
            <button
              id="btn-profile-submit-continue"
              type="submit"
              disabled={isSaving}
              className="w-full h-12 sm:h-13 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] hover:from-[#1D4ED8] hover:via-[#4338CA] hover:to-[#6D28D9] text-white font-semibold text-sm sm:text-base tracking-wide shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving profile...</span>
                </span>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Bottom Subtle Assurance */}
      <div className="w-full max-w-sm text-center mt-3">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Profile photo is optional & stored securely</span>
        </p>
      </div>

      {/* Photo Action Modal / Sheet */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-5 sm:p-6 relative text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Profile Photo</h3>
                <button
                  type="button"
                  onClick={() => {
                    handleStopCamera();
                    setIsPhotoModalOpen(false);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isCapturingCamera ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleStopCamera}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 font-medium text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span>Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 border border-slate-200/70 text-slate-700 font-medium text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span>Choose from Gallery</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 border border-rose-100 text-rose-600 font-medium text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
