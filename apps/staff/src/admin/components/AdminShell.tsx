'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Activity, BarChart3, Building2, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { Avatar } from './ui';
import { useAuth } from '@/lib/auth';

const groups = [
  { label: 'Overview', links: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin/rooms', label: 'Echo rooms', icon: Building2 }] },
  { label: 'Management', links: [{ href: '/admin/staff', label: 'Staff accounts', icon: Users }, { href: '/admin/insights', label: 'AI insights & reports', icon: BarChart3 }, { href: '/admin/audit', label: 'Audit log', icon: ClipboardList }] },
  { label: 'System', links: [{ href: '/admin/settings', label: 'Settings', icon: Settings }] },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const currentPage = groups.flatMap((group) => group.links).find((link) => link.href === pathname)?.label
    ?? (pathname.includes('/profile') ? 'My profile' : 'Administration');

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        document.getElementById('admin-menu-trigger')?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', close); };
  }, [open]);


  async function logout() {
    await signOut();
    router.replace('/login');
    router.refresh();
  }


  return <div className="app-shell">
    <a className="admin-skip-link" href="#admin-main">Skip to content</a>
    <button id="admin-menu-trigger" className="mobile-menu" aria-label="Open navigation" aria-expanded={open} aria-controls="admin-sidebar" onClick={() => setOpen(true)}><Menu size={20} /></button>
    {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside id="admin-sidebar" className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <span className="brand-mark"><Activity size={22} /></span>
        <span><b>EchoFlow</b><small>ECHO Unit Admin</small></span>
        <button aria-label="Close navigation" className="close-nav" onClick={() => setOpen(false)}><X size={18} /></button>
      </div>
      <div className="secure-pill"><ShieldCheck size={14} /> Secure administration</div>
      <nav aria-label="Admin navigation">
        {groups.map((group) => <div className="nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.links.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return <Link onClick={() => setOpen(false)} key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}><Icon size={18} /><span>{label}</span>{active && <ChevronRight size={15} />}</Link>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-profile">
        <Link href="/admin/profile"><Avatar name="D. Jayasuriya" /><span><b>D. Jayasuriya</b><small>Super Admin</small></span></Link>
        <button onClick={logout}><LogOut size={17} /> Log out</button>
      </div>
    </aside>
    <div className="main-content">
      <header className="admin-topbar">
        <div className="admin-breadcrumb"><span>Administration</span><ChevronRight size={14} aria-hidden="true" /><b>{currentPage}</b></div>
        <div className="admin-topbar-actions">
          <span className="admin-demo-badge">Demo workspace</span>
          <Link className="admin-topbar-link" href="/admin/audit" aria-label="View audit log" title="View audit log"><ClipboardList size={19} /></Link>
          <Link className="admin-topbar-profile" href="/admin/profile" aria-label="Open my profile"><Avatar name="D. Jayasuriya" /><span><b>D. Jayasuriya</b><small>Super Admin</small></span><ChevronRight size={15} aria-hidden="true" /></Link>
        </div>
      </header>
      <main id="admin-main" tabIndex={-1} className="content-wrap">{children}</main>
    </div>
  </div>;
}
