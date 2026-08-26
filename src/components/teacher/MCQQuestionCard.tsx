import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { MCQOption, MCQQuestion } from '../../types';

interface MCQQuestionCardProps {
  question: MCQQuestion;
  onAnswerSubmit: (questionId: string, selected: MCQOption) => void;
  onRequestNext?: () => void;
  onAskFollowUp?: (prompt: string) => void;
}

export const MCQQuestionCard: React.FC<MCQQuestionCardProps> = ({
  question,
  onAnswerSubmit,
  onRequestNext,
  onAskFollowUp,
}) => {
  const [selectedOption, setSelectedOption] = useState<MCQOption | null>(
    question.userAnswer || null
  );

  const isAnswered = question.isAnswered || selectedOption !== null;
  const isCorrect = question.isCorrect ?? (selectedOption === question.correctOption);

  const handleSelect = (option: MCQOption) => {
    if (isAnswered) return;
    setSelectedOption(option);
    onAnswerSubmit(question.id, option);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'foundation':
        return { label: 'Foundation', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'conceptual':
        return { label: 'Conceptual', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'tricky':
        return { label: 'Tricky / Application', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'exam_challenge':
        return { label: 'Exam Challenge', bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800' };
      default:
        return { label: 'Conceptual', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const diffInfo = getDifficultyBadge(question.difficulty);
  const optionsList: MCQOption[] = ['A', 'B', 'C', 'D'];

  return (
    <div
      id={`mcq-card-${question.id}`}
      className="my-3 rounded-2xl bg-white dark:bg-[#131d36] border border-slate-200/90 dark:border-slate-800 shadow-md p-4 sm:p-5 transition-all space-y-4"
    >
      {/* Top Meta: Topic & Difficulty */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Practice MCQ
          </span>
          {question.topic && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
              {question.topic}
            </span>
          )}
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${diffInfo.bg}`}>
          {diffInfo.label}
        </span>
      </div>

      {/* Question Text */}
      <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
        {question.question}
      </div>

      {/* Option Buttons */}
      <div className="space-y-2.5 pt-1">
        {optionsList.map((opt) => {
          const optionText = question.options[opt];
          const isThisSelected = (question.userAnswer || selectedOption) === opt;
          const isThisCorrect = question.correctOption === opt;

          let btnStyles = 'bg-slate-50 dark:bg-[#0a0f1d] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-100/80 dark:hover:bg-[#1a2647]';

          if (isAnswered) {
            if (isThisCorrect) {
              btnStyles = 'bg-emerald-50 dark:bg-[#0c2a21] border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-medium';
            } else if (isThisSelected && !isThisCorrect) {
              btnStyles = 'bg-rose-50 dark:bg-[#2c1319] border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20 font-medium';
            } else {
              btnStyles = 'bg-slate-50/60 dark:bg-[#0a0f1d]/50 border-slate-200/60 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={opt}
              type="button"
              id={`mcq-opt-${question.id}-${opt}`}
              disabled={isAnswered}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 text-xs sm:text-sm ${btnStyles} ${
                !isAnswered ? 'cursor-pointer active:scale-[0.99] active:translate-y-0.5' : 'cursor-default'
              }`}
            >
              {/* Option Letter Tag */}
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  isAnswered && isThisCorrect
                    ? 'bg-emerald-600 text-white'
                    : isAnswered && isThisSelected
                    ? 'bg-rose-600 text-white'
                    : isThisSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt}
              </span>

              <span className="flex-1 leading-normal pt-0.5">{optionText}</span>

              {/* Status Icons */}
              {isAnswered && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              {isAnswered && isThisSelected && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Pedagogical Breakdown */}
      {isAnswered && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3.5 animate-fadeIn">
          {/* Result Banner */}
          <div
            className={`flex items-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-semibold ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-[#0c2a21]/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-[#2c1319]/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Excellent reasoning! Correct answer is Option {question.correctOption}.</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>
                  Option {selectedOption} is incorrect. The correct answer is Option {question.correctOption}.
                </span>
              </>
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-1.5 text-xs sm:text-sm">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Conceptual Explanation
            </h5>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-5">
              {question.explanation}
            </p>
          </div>

          {/* Why Selected Distractor was Tempting (if incorrect) */}
          {!isCorrect && selectedOption && question.whyTemptingMap?.[selectedOption] && (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#2a220d]/60 border border-amber-200/80 dark:border-amber-700/50 space-y-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Why Option {selectedOption} was tempting (Common Misconception):
              </div>
              <p className="text-amber-800 dark:text-amber-300 pl-5">
                {question.whyTemptingMap[selectedOption]}
              </p>
            </div>
          )}

          {/* Key Idea & Exam Trap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {question.keyIdea && (
              <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/40">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 mb-0.5 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                  Key Rule to Remember
                </div>
                <p className="text-indigo-800 dark:text-indigo-300">{question.keyIdea}</p>
              </div>
            )}
            {question.examTrap && (
              <div className="p-2.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/70 dark:border-violet-800/40">
                <div className="font-bold text-violet-900 dark:text-violet-200 mb-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-violet-600" />
                  Exam Trap Alert
                </div>
                <p className="text-violet-800 dark:text-violet-300">{question.examTrap}</p>
              </div>
            )}
          </div>

          {/* Follow-up Quick Action Triggers */}
          <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {onAskFollowUp && !isCorrect && selectedOption && (
                <button
                  type="button"
                  onClick={() => onAskFollowUp(`Explain in depth why Option ${selectedOption} is incorrect and why Option ${question.correctOption} is right.`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Why is Option {selectedOption} wrong?
                </button>
              )}
              {onAskFollowUp && (
                <button
                  type="button"
                  onClick={() => onAskFollowUp(`Give me another similar practice question on ${question.topic || 'this topic'}.`)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-all"
                >
                  Similar question
                </button>
              )}
            </div>

            {onRequestNext && (
              <button
                type="button"
                id={`btn-next-mcq-${question.id}`}
                onClick={onRequestNext}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
