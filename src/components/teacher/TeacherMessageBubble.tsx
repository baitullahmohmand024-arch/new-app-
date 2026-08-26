import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  User,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Zap,
  Target,
  RotateCcw,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { AITeacherMessage, AITeacherStudyMode, MCQOption } from '../../types';
import { MCQQuestionCard } from './MCQQuestionCard';

interface TeacherMessageBubbleProps {
  message: AITeacherMessage;
  isThinking?: boolean;
  loadingText?: string;
  onAnswerMCQ?: (questionId: string, selected: MCQOption) => void;
  onRequestNextMCQ?: () => void;
  onAskFollowUp?: (prompt: string) => void;
  onRetry?: () => void;
}

export const TeacherMessageBubble: React.FC<TeacherMessageBubbleProps> = ({
  message,
  isThinking,
  loadingText,
  onAnswerMCQ,
  onRequestNextMCQ,
  onAskFollowUp,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAnimatedBorder, setShowAnimatedBorder] = useState(isThinking || false);
  const isUser = message?.sender === 'user';

  useEffect(() => {
    if (!isThinking && message?.sender === 'teacher' && Date.now() - message.timestamp < 2000) {
      // If it's a brand new message, show border briefly then fade out
      setShowAnimatedBorder(true);
      const timer = setTimeout(() => {
        setShowAnimatedBorder(false);
      }, 600); // Wait a bit then start fade out
      return () => clearTimeout(timer);
    } else {
      setShowAnimatedBorder(isThinking || false);
    }
  }, [isThinking, message]);

  const handleCopy = () => {
    if (message?.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getModeTag = (mode?: AITeacherStudyMode) => {
    switch (mode) {
      case 'learn_concept':
        return { label: 'Concept Mastery', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' };
      case 'practice_mcqs':
        return { label: 'MCQ Practice', icon: Sparkles, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' };
      case 'tricky_mcqs':
        return { label: 'Tricky Conceptual', icon: Zap, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' };
      case 'exam_practice':
        return { label: 'Exam Focus', icon: Target, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60' };
      case 'rapid_revision':
        return { label: 'Rapid Revision', icon: Zap, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60' };
      case 'weak_area_practice':
        return { label: 'Concept Remediation', icon: RotateCcw, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' };
      default:
        return null;
    }
  };

  const modeInfo = getModeTag(message?.studyMode);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-end gap-2.5 my-3"
      >
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-[4px] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-4 py-3 shadow-md">
          <p className="text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap">
            {message?.text}
          </p>
          <div className="mt-1 text-[10px] text-blue-100/70 text-right">
            {new Date(message?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-[#1a2647] flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 text-xs shadow-sm border border-slate-300/50 dark:border-slate-700/50">
          <User className="w-4 h-4" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex justify-start gap-2.5 my-3.5 group"
    >
      {/* Teacher Avatar */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20 border border-indigo-400/30">
        <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </div>

      <div className="max-w-[92%] sm:max-w-[85%] flex-1">
        {/* Header with Mode Tag & Copy */}
        <div className="flex items-center justify-between gap-2 mb-1.5 ml-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              AI Academic Teacher
            </span>
            {modeInfo && !isThinking && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${modeInfo.color}`}>
                <modeInfo.icon className="w-3 h-3" />
                {modeInfo.label}
              </span>
            )}
          </div>
          {!isThinking && !message?.isError && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy explanation"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#131d36] transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Message Content Bubble with Premium Outline */}
        <div className="relative rounded-2xl p-[1.5px] shadow-sm overflow-hidden rounded-tl-[4px]">
          {/* Animated Gradient Background layer */}
          <div
            className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,#3b82f6,#6366f1,#a855f7,#ec4899,#3b82f6)] transition-opacity duration-1000 ease-in-out motion-reduce:animate-none animate-[spin_4s_linear_infinite] ${
              showAnimatedBorder ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Static border layer for completed state */}
          <div
            className={`absolute inset-0 rounded-2xl rounded-tl-[4px] border transition-colors duration-1000 ${
              showAnimatedBorder ? 'border-transparent' : message?.isError ? 'border-rose-200 dark:border-rose-900/60' : 'border-slate-200/80 dark:border-slate-700/80'
            }`}
          />

          {/* Inner Content Container */}
          <div
            className={`relative rounded-[14.5px] rounded-tl-[3px] px-4 py-3.5 h-full ${
              message?.isError
                ? 'bg-rose-50/95 dark:bg-[#2a1318]/95 text-rose-900 dark:text-rose-200'
                : 'bg-white/95 dark:bg-[#0f172a]/95 text-slate-800 dark:text-slate-200'
            }`}
          >
            {isThinking ? (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm py-1">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>
                  {loadingText || 'Thinking'}
                  <span className="inline-flex tracking-widest ml-0.5 w-4">
                    <span className="animate-[bounce_1.4s_infinite_0s] motion-reduce:animate-none">.</span>
                    <span className="animate-[bounce_1.4s_infinite_0.2s] motion-reduce:animate-none">.</span>
                    <span className="animate-[bounce_1.4s_infinite_0.4s] motion-reduce:animate-none">.</span>
                  </span>
                </span>
              </div>
            ) : (
              <>
                {message?.text && (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-[13px] sm:text-[15px] leading-[1.65] prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-h3:text-indigo-900 dark:prose-h3:text-indigo-200 prose-p:my-2.5 prose-ul:my-2.5 prose-li:my-1 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-strong:font-semibold prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-slate-100 dark:prose-code:bg-[#1a2647] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[12px] prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:px-4 prose-blockquote:py-1.5 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:my-3 prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300">
                    <Markdown>{message.text}</Markdown>
                  </div>
                )}

                {/* Interactive MCQ Card if attached */}
                {message?.mcqQuestion && (
                  <div className="mt-3">
                    <MCQQuestionCard
                      question={message.mcqQuestion}
                      onAnswerSubmit={onAnswerMCQ || (() => {})}
                      onRequestNext={onRequestNextMCQ}
                      onAskFollowUp={onAskFollowUp}
                    />
                  </div>
                )}

                {/* Retry Button for transient error states */}
                {message?.isError && onRetry && (
                  <div className="mt-4 pt-3 border-t border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                      Tap to re-send your question
                    </span>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Timestamp */}
        {!isThinking && message && (
          <div className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 text-right pr-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
