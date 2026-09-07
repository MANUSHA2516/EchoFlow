'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-header">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p>{description}</p></div>
    {actions && <div className="header-actions">{actions}</div>}
  </div>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Status({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
  return <span className={`status status-${tone}`}><i />{children}</span>;
}

export function Modal({ title, subtitle, onClose, children, wide = false }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
      <div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      {children}
    </div>
  </div>;
}

export function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: () => void; label: string; detail?: string }) {
  return <button type="button" className="toggle-row" onClick={onChange}>
    <span><b>{label}</b>{detail && <small>{detail}</small>}</span>
    <span className={`switch ${checked ? 'on' : ''}`}><i /></span>
  </button>;
}

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name.split(' ').map((part) => part[0]).join('').replace('.', '').slice(0, 2);
  return <span className={`avatar ${large ? 'avatar-large' : ''}`}>{initials}</span>;
}
