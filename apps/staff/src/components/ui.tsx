'use client';

import { useEffect, useId, useRef } from 'react';
import { LucideIcon, X } from 'lucide-react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="staff-page-header">
      <div className="staff-page-heading">
        {eyebrow && <p className="staff-eyebrow">{eyebrow}</p>}
        <h1 className="staff-page-title">{title}</h1>
        <p className="staff-page-description">{description}</p>
      </div>
      {actions && <div className="staff-page-actions">{actions}</div>}
    </header>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`staff-card rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function MetricCard({ label, value, note, icon: Icon, tone = 'teal' }: { label: string; value: string; note: string; icon: LucideIcon; tone?: 'teal' | 'cyan' | 'amber' | 'rose' }) {
  return (
    <Card className="staff-metric-card">
      <div className="staff-metric-top">
        <p className="staff-metric-label">{label}</p>
        <span className={`staff-metric-icon tone-${tone}`}><Icon size={18} /></span>
      </div>
      <p className="staff-metric-value">{value}</p>
      <p className="staff-metric-note">{note}</p>
    </Card>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  return <button className={`staff-button staff-button--${variant} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'slate' | 'amber' | 'rose' | 'cyan' }) {
  return <span className={`staff-badge tone-${tone}`}>{children}</span>;
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="staff-field"><span className="staff-field-label">{label}</span><input className="staff-input" {...props} /></label>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') ?? []);
    (focusable()[0] ?? dialog.current)?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="staff-modal-backdrop" onMouseDown={onClose}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="staff-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="staff-modal-header">
          <div><p className="staff-eyebrow">EchoFlow Intake</p><h2 id={titleId}>{title}</h2></div>
          <button onClick={onClose} className="staff-modal-close" aria-label="Close modal"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
