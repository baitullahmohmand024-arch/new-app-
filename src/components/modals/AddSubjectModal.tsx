import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import {
  X,
  Plus,
  BookOpen,
  Calculator,
  Atom,
  Dna,
  Code,
  Layers,
  Compass,
  Briefcase,
  Palette,
  GraduationCap,
} from 'lucide-react';
import { Subject, SubjectIconName, ColorTheme } from '../../types';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, iconName: SubjectIconName, colorTheme: ColorTheme) => void;
  fieldName: string;
  existingSubjectNames: string[];
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  fieldName,
  existingSubjectNames,
}) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState<SubjectIconName>('BookOpen');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('blue');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const icons: Array<{ id: SubjectIconName; label: string; icon: React.ReactNode }> = [
    { id: 'Calculator', label: 'Math', icon: <Calculator className="w-4 h-4" /> },
    { id: 'Atom', label: 'Physics', icon: <Atom className="w-4 h-4" /> },
    { id: 'Dna', label: 'Biology', icon: <Dna className="w-4 h-4" /> },
    { id: 'Layers', label: 'Chemistry', icon: <Layers className="w-4 h-4" /> },
    { id: 'Code', label: 'Computer Sci', icon: <Code className="w-4 h-4" /> },
    { id: 'BookOpen', label: 'Literature', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'Compass', label: 'Engineering', icon: <Compass className="w-4 h-4" /> },
    { id: 'Briefcase', label: 'Commerce', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'Palette', label: 'Arts', icon: <Palette className="w-4 h-4" /> },
    { id: 'GraduationCap', label: 'General', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  const colors: Array<{ id: ColorTheme; label: string; bg: string }> = [
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'violet', label: 'Violet', bg: 'bg-violet-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Subject name cannot be empty.');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Subject name must be 50 characters or fewer.');
      return;
    }
    const isDuplicate = existingSubjectNames.some(
      (n) => n.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A subject named "${trimmedName}" already exists in ${fieldName}.`);
      return;
    }

    onAdd(trimmedName, iconName, colorTheme);
    setName('');
    setIconName('BookOpen');
    setColorTheme('blue');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-md animate-modal-enter">
        <Card className="shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Add Subject to {fieldName}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Subject Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Linear Algebra, Genetics, English Literature"
                autoFocus
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Subject Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {icons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIconName(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      iconName === item.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                Color Accent
              </label>
              <div className="flex items-center gap-2.5">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColorTheme(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                      colorTheme === c.id
                        ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                id="submit-create-subject-btn"
                type="submit"
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                disabled={!name.trim()}
              >
                Create Subject
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
