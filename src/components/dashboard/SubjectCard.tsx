import React, { useState } from 'react';
import { Subject, SubjectIconName } from '../../types';
import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookOpen,
  Code,
  Laptop,
  Layers,
  Compass,
  Briefcase,
  Palette,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Camera,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  chapterCount?: number;
  photoCount?: number;
  completedChapterCount?: number;
  onClick: (subject: Subject) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onMoveUp?: (subject: Subject) => void;
  onMoveDown?: (subject: Subject) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  chapterCount = 0,
  photoCount = 0,
  completedChapterCount = 0,
  onClick,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Calculate real progress percentage from completed chapters / total chapters
  const progressPercent =
    chapterCount > 0 ? Math.min(100, Math.round((completedChapterCount / chapterCount) * 100)) : 0;

  // Subject icon resolver with realistic & recognizable vector icons sized for mobile
  const getSubjectIcon = (name: string, iconName: SubjectIconName) => {
    const lower = name.toLowerCase();

    if (lower.includes('math') || lower.includes('algebra') || lower.includes('calculus') || iconName === 'Calculator') {
      return <Calculator className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('physic') || lower.includes('mechanic') || iconName === 'Atom') {
      return <Atom className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('chem') || lower.includes('organic') || lower.includes('inorganic')) {
      return <FlaskConical className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('bio') || lower.includes('botany') || lower.includes('zoology') || lower.includes('mdcat') || iconName === 'Dna') {
      return <Dna className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('comp') || lower.includes('program') || lower.includes('coding') || lower.includes('cs') || lower.includes('software') || iconName === 'Code') {
      return <Laptop className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('eng') || lower.includes('lit') || lower.includes('urdu') || lower.includes('language') || iconName === 'BookOpen') {
      return <BookOpen className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('business') || lower.includes('commerc') || lower.includes('account') || lower.includes('econ') || iconName === 'Briefcase') {
      return <Briefcase className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (lower.includes('art') || lower.includes('design') || lower.includes('draw') || iconName === 'Palette') {
      return <Palette className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (iconName === 'Compass') {
      return <Compass className="w-5 h-5 text-white stroke-[2]" />;
    }
    if (iconName === 'GraduationCap') {
      return <GraduationCap className="w-5 h-5 text-white stroke-[2]" />;
    }

    return <Layers className="w-5 h-5 text-white stroke-[2]" />;
  };

  // Distinct rich color gradient mapping matching the reference
  const getSubjectColorTheme = (name: string, colorTheme: string) => {
    const lower = name.toLowerCase();

    // 1. Mathematics -> Royal Blue
    if (lower.includes('math') || lower.includes('algebra') || lower.includes('calculus')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF]',
        shadow: 'shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-blue-900/40 text-blue-100 border-blue-400/30',
      };
    }

    // 2. Physics -> Vibrant Purple / Violet
    if (lower.includes('physic') || lower.includes('mechanic')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]',
        shadow: 'shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-purple-900/40 text-purple-100 border-purple-400/30',
      };
    }

    // 3. Chemistry -> Fresh Emerald / Teal
    if (lower.includes('chem') || lower.includes('organic') || lower.includes('inorganic')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#059669] via-[#047857] to-[#065F46]',
        shadow: 'shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-emerald-900/40 text-emerald-100 border-emerald-400/30',
      };
    }

    // 4. Computer Science -> Energetic Orange / Amber
    if (lower.includes('comp') || lower.includes('program') || lower.includes('code') || lower.includes('cs')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#EA580C] via-[#C2410C] to-[#9A3412]',
        shadow: 'shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-orange-900/40 text-orange-100 border-orange-400/30',
      };
    }

    // 5. English / Languages -> Rose / Crimson Pink
    if (lower.includes('eng') || lower.includes('lit') || lower.includes('urdu') || lower.includes('lang')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#9F1239]',
        shadow: 'shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-rose-900/40 text-rose-100 border-rose-400/30',
      };
    }

    // 6. Biology -> Teal / Cyan Jade
    if (lower.includes('bio') || lower.includes('botany') || lower.includes('zoology') || lower.includes('mdcat')) {
      return {
        cardBg: 'bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#115E59]',
        shadow: 'shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30',
        iconBg: 'bg-white/20 border-white/25',
        progressBg: 'bg-white/25',
        progressBar: 'bg-white',
        accentBadge: 'bg-teal-900/40 text-teal-100 border-teal-400/30',
      };
    }

    // Theme fallback based on subject.colorTheme
    switch (colorTheme) {
      case 'emerald':
        return {
          cardBg: 'bg-gradient-to-br from-[#059669] via-[#047857] to-[#065F46]',
          shadow: 'shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-emerald-900/40 text-emerald-100 border-emerald-400/30',
        };
      case 'violet':
        return {
          cardBg: 'bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]',
          shadow: 'shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-purple-900/40 text-purple-100 border-purple-400/30',
        };
      case 'amber':
        return {
          cardBg: 'bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#92400E]',
          shadow: 'shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-amber-900/40 text-amber-100 border-amber-400/30',
        };
      case 'rose':
        return {
          cardBg: 'bg-gradient-to-br from-[#E11D48] via-[#BE123C] to-[#9F1239]',
          shadow: 'shadow-lg shadow-rose-600/20 hover:shadow-rose-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-rose-900/40 text-rose-100 border-rose-400/30',
        };
      case 'cyan':
        return {
          cardBg: 'bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985]',
          shadow: 'shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-sky-900/40 text-sky-100 border-sky-400/30',
        };
      case 'blue':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF]',
          shadow: 'shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30',
          iconBg: 'bg-white/20 border-white/25',
          progressBg: 'bg-white/25',
          progressBar: 'bg-white',
          accentBadge: 'bg-blue-900/40 text-blue-100 border-blue-400/30',
        };
    }
  };

  const theme = getSubjectColorTheme(subject.name, subject.colorTheme);

  return (
    <div
      id={`subject-card-${subject.id}`}
      onClick={() => onClick(subject)}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white ${theme.cardBg} ${theme.shadow} border border-white/15 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-[0.985] cursor-pointer select-none`}
    >
      {/* Background Decorative Radial Shimmer */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-6 w-24 h-24 rounded-full bg-black/10 blur-lg pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col justify-between min-h-[110px] sm:min-h-[118px]">
        {/* Top Row: Icon + Name + Right Arrow / Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Subject Specific Icon Badge (Mobile optimized size ~40px) */}
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center border shrink-0 backdrop-blur-xs transition-transform duration-200 group-hover:scale-105 ${theme.iconBg}`}
            >
              {getSubjectIcon(subject.name, subject.iconName)}
            </div>

            {/* Subject Name & Custom Badge */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-white tracking-tight leading-snug truncate">
                  {subject.name}
                </h3>
                {subject.isCustom && (
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border ${theme.accentBadge}`}
                  >
                    Custom
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls: Arrow & Context Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Context Menu Toggle for Mobile / Web */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/15 active:scale-90 flex items-center justify-center transition-colors cursor-pointer"
                title="Subject actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Popover Action Menu */}
              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-30 w-36 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 p-1 text-xs font-semibold space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  {canMoveUp && onMoveUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onMoveUp(subject);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>Move Up</span>
                    </button>
                  )}
                  {canMoveDown && onMoveDown && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onMoveDown(subject);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Move Down</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(subject);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Rename</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(subject);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 text-left cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prominent Right-facing Navigation Arrow */}
            <div className="w-7 h-7 rounded-lg text-white/80 group-hover:text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-4 h-4 stroke-[2.25]" />
            </div>
          </div>
        </div>

        {/* Middle / Bottom Row: Chapters, Photos & Progress Info */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          {/* Left stats: Chapters & Board Photos */}
          <div className="flex items-center gap-3 text-xs sm:text-[13px] text-white/90 font-medium">
            <span className="flex items-center gap-1 font-semibold text-white">
              <span>{chapterCount}</span>
              <span className="text-white/80 font-normal">
                {chapterCount === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </span>

            <span className="text-white/40">•</span>

            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-white/70" />
              <span>{photoCount}</span>
              <span className="text-white/80 font-normal">
                {photoCount === 1 ? 'Photo' : 'Photos'}
              </span>
            </span>
          </div>

          {/* Right progress indicator: Bar + % */}
          <div className="flex items-center gap-2 w-full sm:w-36 self-end sm:self-auto pt-1 sm:pt-0">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme.progressBg}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${theme.progressBar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white tracking-wide shrink-0 min-w-[32px] text-right">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
