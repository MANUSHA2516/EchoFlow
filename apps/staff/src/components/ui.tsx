'use client';

import { LucideIcon, X } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-teal-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function MetricCard({ label, value, note, icon: Icon, tone = 'teal' }: { label: string; value: string; note: string; icon: LucideIcon; tone?: 'teal' | 'cyan' | 'amber' | 'rose' }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700',
    cyan: 'bg-cyan-50 text-cyan-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </Card>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm shadow-teal-900/10',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'slate' | 'amber' | 'rose' | 'cyan' }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 ring-teal-600/15',
    slate: 'bg-slate-100 text-slate-600 ring-slate-500/10',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/15',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/15',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-600/15',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50 disabled:text-slate-500" {...props} /></label>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">EchoFlow Intake</p><h2 className="mt-1 text-xl font-bold">{title}</h2></div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
