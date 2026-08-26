import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  glass?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  glass = false,
  className = '',
  id,
  ...props
}) => {
  const baseBg = glass
    ? 'bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800/80'
    : 'bg-white dark:bg-[#131d36] border-slate-200/80 dark:border-slate-800/80';

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-indigo-400/80 dark:hover:border-indigo-500/70 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:shadow-xs touch-manipulation'
    : '';

  return (
    <div
      id={id}
      className={`border rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 ease-out ${baseBg} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


