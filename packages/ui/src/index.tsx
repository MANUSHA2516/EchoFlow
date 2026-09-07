import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export type StatusTone = 'live' | 'urgent' | 'normal' | 'success' | 'warning' | 'muted';

const toneClass: Record<StatusTone, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
  normal: 'bg-sky-50 text-sky-700 border-sky-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  muted: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function StatusBadge({
  tone = 'normal',
  children,
}: PropsWithChildren<{ tone?: StatusTone }>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonClass: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm hover:from-teal-700 hover:to-cyan-700',
  secondary: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
