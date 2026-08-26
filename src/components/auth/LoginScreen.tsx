import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  ShieldCheck,
  Mail,
  Lock,
  User,
  AlertCircle,
  LockKeyhole,
  CheckCircle2,
} from 'lucide-react';
import { AuthService } from '../../services/auth';
import welcomeIllustration from '../../assets/images/study_welcome_illustration_1787671564317.jpg';
import googleShieldIllustration from '../../assets/images/google_security_shield_1787671995466.jpg';

interface LoginScreenProps {
  onSignInWithGoogle: (email?: string, name?: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignInWithGoogle }) => {
  // Navigation step state: 'welcome' (Step 1) -> 'auth_screen' (Step 2)
  const [currentStep, setCurrentStep] = useState<'welcome' | 'auth_screen'>('welcome');
  
  // Auth method toggle on step 2: 'google' | 'email'
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email / Password Form State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Primary: Handle Google Sign-In with Account Selection
  const handleGoogleLogin = async () => {
    if (isLoading) return; // Prevent repeated tap / duplicate requests
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await onSignInWithGoogle();
    } catch (err: any) {
      console.warn('Google authentication status:', err?.message || err);
      if (err?.message === 'POPUP_CLOSED') {
        // User voluntarily dismissed the Google picker; return to sign-in screen cleanly with no technical error
        setErrorMessage(null);
      } else {
        // Non-technical, user-friendly error message
        setErrorMessage("Couldn't sign you in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Secondary: Quick Demo / Testing Accounts
  const handleQuickStudentLogin = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await onSignInWithGoogle(email, name);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Couldn't sign you in with student profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tertiary: Firebase Email/Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (isRegisterMode) {
        await AuthService.signUpWithEmail(emailInput.trim(), passwordInput, nameInput.trim());
      } else {
        await AuthService.signInWithEmail(emailInput.trim(), passwordInput);
      }

      await onSignInWithGoogle(emailInput.trim(), nameInput.trim() || undefined);
    } catch (err: any) {
      console.error('Firebase email auth error:', err);
      let msg = "Couldn't sign you in. Please check your credentials.";
      if (err?.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify your credentials.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFD] text-slate-900 flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 select-none overflow-x-hidden relative">
      {/* Background Soft Atmospheric Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Top-Right Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-100/35 blur-3xl" />
        {/* Subtle Bottom-Left Ambient Glow */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-100/35 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* STEP 1: WELCOME / GET STARTED SCREEN                     */}
        {/* ======================================================== */}
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome-step"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex-1 flex flex-col justify-between items-center"
          >
            {/* Top Spacer */}
            <div className="w-full max-w-sm h-4 sm:h-6" />

            {/* Main Content Container */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col items-center z-10 text-center">
              {/* 1. Header Text Section */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1 sm:space-y-1.5"
              >
                <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-500 uppercase">
                  Welcome to
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] leading-tight">
                  Easy <span className="text-[#2563EB]">Study</span> Snap
                </h1>
              </motion.div>

              {/* 2. Subtitle Description */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 max-w-[290px] sm:max-w-xs"
              >
                <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-slate-600">
                  Keep your board photos organized and easy to study.
                </p>
              </motion.div>

              {/* 3. Educational Illustration Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="relative my-6 sm:my-8 w-full flex items-center justify-center"
              >
                {/* Subtle Abstract Backdrop Shapes */}
                <div className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-indigo-100/50 via-blue-50/60 to-purple-100/40 -z-10 blur-xl transform scale-95" />

                {/* Floating Subtle Sparkles / Dots */}
                <div className="absolute -top-1 -right-2 text-indigo-400/80 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="absolute bottom-4 -left-2 w-2 h-2 rounded-full bg-blue-300/80" />
                <div className="absolute top-8 -left-3 w-1.5 h-1.5 rounded-full bg-indigo-300/70" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-200/90" />

                {/* Main 3D Educational Artwork */}
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/10 border border-slate-100/80 bg-white/80 backdrop-blur-xs flex items-center justify-center p-2 transition-transform duration-500 hover:scale-[1.02]">
                  <img
                    src={welcomeIllustration}
                    alt="Easy Study Snap Educational Illustration"
                    className="w-full h-full object-contain mix-blend-multiply"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* 4. Onboarding Page Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.38 }}
                className="flex items-center justify-center gap-1.5 mb-6 sm:mb-8"
              >
                <span className="w-6 h-2 rounded-full bg-[#2563EB] transition-all duration-300" />
                <span className="w-2 h-2 rounded-full bg-indigo-100" />
                <span className="w-2 h-2 rounded-full bg-indigo-100" />
                <span className="w-2 h-2 rounded-full bg-indigo-100" />
              </motion.div>

              {/* 5. Primary Action: Get Started Button */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-xs sm:max-w-sm"
              >
                <button
                  id="btn-welcome-get-started"
                  onClick={() => {
                    setAuthMethod('google');
                    setCurrentStep('auth_screen');
                  }}
                  className="w-full h-13 sm:h-14 px-6 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-semibold text-base sm:text-[17px] tracking-wide shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started</span>
                </button>
              </motion.div>

              {/* 6. Secondary Action: Sign In Option */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="mt-4 sm:mt-5 text-xs sm:text-sm text-slate-500 font-normal"
              >
                <span>Already have an account? </span>
                <button
                  id="btn-welcome-sign-in"
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setCurrentStep('auth_screen');
                  }}
                  className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer ml-1 transition-colors"
                >
                  Sign In
                </button>
              </motion.div>
            </div>

            {/* Bottom Trust Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Private student workspace & cloud backup</span>
            </motion.div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: SIGN-IN SCREEN (GOOGLE & EMAIL/PASSWORD)         */}
        {/* ======================================================== */}
        {currentStep === 'auth_screen' && (
          <motion.div
            key="auth-step"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex-1 flex flex-col justify-between items-center max-w-sm sm:max-w-md mx-auto"
          >
            {/* Top Navigation Bar with Back Button */}
            <div className="w-full flex items-center justify-between z-20 mb-2">
              <motion.button
                id="btn-auth-back"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setCurrentStep('welcome');
                }}
                className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-200/50 active:scale-95 transition-all cursor-pointer"
                title="Back to Welcome"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
              </motion.button>

              {/* Method Switch Pills */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMethod === 'google'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Email / Password
                </button>
              </div>
            </div>

            {/* Center Main Content Area */}
            <div className="w-full flex flex-col items-center z-10 text-center px-1 my-auto py-2">
              {authMethod === 'google' ? (
                /* ----------------- GOOGLE AUTH VIEW ----------------- */
                <div className="w-full flex flex-col items-center">
                  {/* 1. Google Security Shield Illustration */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="relative my-3 sm:my-5 w-full flex items-center justify-center"
                  >
                    {/* Soft Lavender / Indigo Ambient Glow */}
                    <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-indigo-100/60 via-purple-50/50 to-blue-100/50 -z-10 blur-xl transform scale-95" />

                    {/* Floating Subtle Sparkles & Cloud Shapes */}
                    <div className="absolute -top-1 -right-1 text-indigo-400/80 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="absolute bottom-2 -left-1 text-purple-300/80">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="absolute top-6 -left-2 w-2 h-2 rounded-full bg-blue-300/70" />
                    <div className="absolute bottom-3 right-1 w-2 h-2 rounded-full bg-indigo-300/70" />

                    {/* Main 3D Shield Artwork Card */}
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/10 border border-slate-100/80 bg-white/90 backdrop-blur-xs flex items-center justify-center p-2 transition-transform duration-500 hover:scale-[1.02]">
                      <img
                        src={googleShieldIllustration}
                        alt="Google Account Security Shield"
                        className="w-full h-full object-contain mix-blend-multiply"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </motion.div>

                  {/* 2. Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] leading-snug"
                  >
                    Save your study space
                  </motion.h2>

                  {/* 3. Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2 max-w-[280px] sm:max-w-xs text-sm sm:text-[15px] font-normal leading-relaxed text-slate-600"
                  >
                    Sign in to keep your study material safe and accessible across devices.
                  </motion.p>

                  {/* Error Notice */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 max-w-xs flex flex-col gap-2 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span className="flex-1 font-medium">{errorMessage}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="self-end px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  )}

                  {/* 4. Google Sign-In Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-xs sm:max-w-sm mt-6 sm:mt-7 space-y-3"
                  >
                    <button
                      id="btn-google-sign-in"
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full h-13 sm:h-14 px-5 rounded-2xl bg-white hover:bg-slate-50/90 text-slate-800 font-semibold text-sm sm:text-[15px] tracking-normal border border-slate-200/90 shadow-md shadow-slate-200/60 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2.5 text-slate-600">
                          <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          <span>Signing in...</span>
                        </span>
                      ) : (
                        <>
                          <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                            />
                          </svg>
                          <span className="text-slate-800 font-medium">Continue with Google</span>
                        </>
                      )}
                    </button>

                    {/* Quick switch to email */}
                    <button
                      type="button"
                      onClick={() => setAuthMethod('email')}
                      className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Or sign in with email & password</span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                /* ----------------- EMAIL / PASSWORD FORM ----------------- */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-xs sm:max-w-sm flex flex-col items-center bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <LockKeyhole className="w-5 h-5" />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                    {isRegisterMode ? 'Create Student Account' : 'Student Email Sign In'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {isRegisterMode
                      ? 'Register with your email and password to sync your notes'
                      : 'Enter your credentials to access your study space'}
                  </p>

                  {/* Error Notice */}
                  {errorMessage && (
                    <div className="mb-4 w-full p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span className="flex-1">{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleEmailAuth} className="w-full space-y-3 text-left">
                    {isRegisterMode && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Student Name"
                            required
                            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="student@example.com"
                          required
                          className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      id="btn-email-submit"
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 sm:h-12 mt-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isRegisterMode ? 'Creating...' : 'Signing in...'}</span>
                        </span>
                      ) : (
                        <span>{isRegisterMode ? 'Create Student Account' : 'Sign In with Email'}</span>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegisterMode(!isRegisterMode);
                          setErrorMessage(null);
                        }}
                        className="text-xs text-[#2563EB] font-semibold hover:underline cursor-pointer"
                      >
                        {isRegisterMode
                          ? 'Already have an account? Sign In'
                          : "Don't have an account? Register"}
                      </button>
                    </div>
                  </form>

                  {/* Demo Testing Student Accounts */}
                  <div className="w-full pt-3 mt-3 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Demo Profiles:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickStudentLogin('baitullahmohmand024@gmail.com', 'Baitullah Mohmand')
                        }
                        className="p-2 rounded-xl text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-center truncate cursor-pointer"
                      >
                        Baitullah
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickStudentLogin('sarah.khan@gmail.com', 'Sarah Khan')
                        }
                        className="p-2 rounded-xl text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-center truncate cursor-pointer"
                      >
                        Sarah (Med)
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 5. Bottom Privacy Assurance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.5 }}
              className="text-xs text-slate-400 text-center max-w-xs mt-3 flex items-center justify-center gap-1.5"
            >
              <LockKeyhole className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>We will never share your information with anyone.</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
