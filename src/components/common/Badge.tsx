import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'info' | 'gold';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
  id,
}) => {
  const variantClasses = {
    primary:
      'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-[#1a2647] dark:text-indigo-300 dark:border-indigo-700/50 shadow-xs shadow-indigo-500/5',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-[#0c2a21] dark:text-emerald-300 dark:border-emerald-700/50 shadow-xs shadow-emerald-500/5',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-[#2e210a] dark:text-amber-300 dark:border-amber-700/50 shadow-xs shadow-amber-500/5',
    info:
      'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-[#092b3b] dark:text-cyan-300 dark:border-cyan-700/50 shadow-xs shadow-cyan-500/5',
    gold:
      'bg-amber-50/90 text-amber-800 border-amber-300/80 dark:bg-[#2a220d] dark:text-amber-200 dark:border-amber-600/50 shadow-xs shadow-amber-500/10',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-[#131d36] dark:text-slate-300 dark:border-slate-800 shadow-xs',
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
