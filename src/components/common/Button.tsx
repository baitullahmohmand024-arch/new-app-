import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  id,
  disabled,
  loading = false,
  ...props
}) => {
  const baseClasses =
    'group inline-flex items-center justify-center font-semibold rounded-xl select-none cursor-pointer touch-manipulation transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-[#0a0f1d] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none active:translate-y-0.5 active:scale-[0.98] active:shadow-xs active:brightness-95';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white shadow-sm shadow-indigo-900/20 hover:shadow-md hover:shadow-indigo-600/30 hover:-translate-y-0.5 border border-indigo-400/30 dark:border-indigo-400/20',
    secondary:
      'bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 dark:bg-[#131d36] dark:hover:bg-[#1a2647] dark:text-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus-visible:ring-slate-400',
    outline:
      'border border-slate-300/90 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-[#131d36]/80 hover:bg-slate-50 dark:hover:bg-[#1a2647] hover:border-indigo-400/60 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-indigo-400',
    ghost:
      'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#131d36]/80 hover:-translate-y-0.5 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800/60 focus-visible:ring-slate-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm shadow-rose-900/20 hover:shadow-md hover:shadow-rose-600/30 hover:-translate-y-0.5 border border-rose-400/30 focus-visible:ring-rose-500',
    glass:
      'bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/90 shadow-xs hover:bg-white dark:hover:bg-[#131d36] hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-indigo-400',
  };

  return (
    <button
      id={id}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5">{icon}</span>
      )}
      {children && <span className="whitespace-nowrap">{children}</span>}
    </button>
  );
};

