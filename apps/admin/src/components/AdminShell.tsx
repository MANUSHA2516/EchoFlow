'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Activity, BarChart3, Building2, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { Avatar } from './ui';

const groups = [
  { label: 'Overview', links: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }, { href: '/rooms', label: 'Echo rooms', icon: Building2 }] },
  { label: 'Management', links: [{ href: '/staff', label: 'Staff accounts', icon: Users }, { href: '/insights', label: 'AI insights & reports', icon: BarChart3 }, { href: '/audit', label: 'Audit log', icon: ClipboardList }] },
  { label: 'System', links: [{ href: '/settings', label: 'Settings', icon: Settings }] },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('echoflow-admin-session')) router.replace('/login');
    else setReady(true);
  }, [router]);

  function logout() {
    localStorage.removeItem('echoflow-admin-session');
    router.push('/login');
  }

  if (!ready) return <main className="loading-screen"><Activity className="pulse" /><p>Opening secure admin console…</p></main>;

  return <div className="app-shell">
    <button className="mobile-menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
    {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <span className="brand-mark"><Activity size={22} /></span>
        <span><b>EchoFlow</b><small>ECHO Unit Admin</small></span>
        <button className="close-nav" onClick={() => setOpen(false)}><X size={18} /></button>
      </div>
      <div className="secure-pill"><ShieldCheck size={14} /> Secure administration</div>
      <nav>
        {groups.map((group) => <div className="nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.links.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return <Link onClick={() => setOpen(false)} key={href} href={href} className={active ? 'active' : ''}><Icon size={18} /><span>{label}</span>{active && <ChevronRight size={15} />}</Link>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-profile">
        <Link href="/profile"><Avatar name="D. Jayasuriya" /><span><b>D. Jayasuriya</b><small>Super Admin</small></span></Link>
        <button onClick={logout}><LogOut size={17} /> Log out</button>
      </div>
    </aside>
    <main className="main-content"><div className="content-wrap">{children}</div></main>
  </div>;
}
