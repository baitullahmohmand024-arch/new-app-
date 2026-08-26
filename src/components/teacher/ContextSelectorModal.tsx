import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Check,
  Globe,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { AcademicField, Subject, Chapter, AITeacherContext } from '../../types';

interface ContextSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: AcademicField[];
  subjects: Subject[];
  chapters: Chapter[];
  currentContext?: AITeacherContext;
  onSelectContext: (context: AITeacherContext | undefined) => void;
}

export const ContextSelectorModal: React.FC<ContextSelectorModalProps> = ({
  isOpen,
  onClose,
  fields,
  subjects,
  chapters,
  currentContext,
  onSelectContext,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    currentContext?.fieldId || fields[0]?.id || ''
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentContext?.subjectId || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    currentContext?.chapterId || ''
  );

  if (!isOpen) return null;

  const currentField = fields.find((f) => f.id === selectedFieldId);
  const fieldSubjects = subjects.filter(
    (s) => !s.isDeleted && s.fieldId === selectedFieldId
  );
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const subjectChapters = chapters.filter(
    (c) => !c.isDeleted && c.subjectId === selectedSubjectId
  );

  const handleApply = () => {
    if (!selectedFieldId) {
      onSelectContext(undefined);
      onClose();
      return;
    }

    const fieldObj = fields.find((f) => f.id === selectedFieldId);
    const subjectObj = subjects.find((s) => s.id === selectedSubjectId);
    const chapterObj = chapters.find((c) => c.id === selectedChapterId);

    const context: AITeacherContext = {
      fieldId: fieldObj?.id,
      fieldName: fieldObj?.name,
      subjectId: subjectObj?.id,
      subjectName: subjectObj?.name,
      chapterId: chapterObj?.id,
      chapterTitle: chapterObj?.title,
      chapterNumber: chapterObj?.chapterNumber,
    };

    onSelectContext(context);
    onClose();
  };

  const handleClearContext = () => {
    onSelectContext(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Select Study Context
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Focus your AI Teacher on a specific subject and chapter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#131d36] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* General Study / No Context Option */}
          <button
            type="button"
            onClick={handleClearContext}
            className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
              !currentContext
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  General Academic Mode
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Ask any question across any academic subject freely
                </div>
              </div>
            </div>
            {!currentContext && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          </button>

          {/* Academic Field Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Academic Track / Field
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fields.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedFieldId(f.id);
                    setSelectedSubjectId('');
                    setSelectedChapterId('');
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedFieldId === f.id
                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/30'
                      : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2647]'
                  }`}
                >
                  <div className="truncate">{f.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          {selectedFieldId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject
              </label>
              {fieldSubjects.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No subjects found in this field.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {fieldSubjects.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubjectId(s.id);
                        setSelectedChapterId('');
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                        selectedSubjectId === s.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500/30'
                          : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2647]'
                      }`}
                    >
                      <div className="truncate">{s.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chapter Selection */}
          {selectedSubjectId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Chapter (Optional)
              </label>
              {subjectChapters.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">
                  No chapters yet in this subject. You can still practice at the subject level.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedChapterId('')}
                    className={`w-full p-2 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                      selectedChapterId === ''
                        ? 'bg-violet-50 dark:bg-violet-950/70 border-violet-500 text-violet-900 dark:text-violet-200'
                        : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Entire Subject (All Chapters)
                  </button>
                  {subjectChapters.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedChapterId(c.id)}
                      className={`w-full p-2 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer truncate ${
                        selectedChapterId === c.id
                          ? 'bg-violet-50 dark:bg-violet-950/70 border-violet-500 text-violet-900 dark:text-violet-200 ring-1 ring-violet-500/30'
                          : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2647]'
                      }`}
                    >
                      Ch. {c.chapterNumber}: {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0a0f1d]/70 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md cursor-pointer transition-all active:scale-95"
          >
            Apply Context
          </button>
        </div>
      </div>
    </div>
  );
};
