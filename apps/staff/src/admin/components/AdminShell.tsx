'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
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


  async function logout() {
    await signOut();
    router.replace('/login');
    router.refresh();
  }


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
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return <Link onClick={() => setOpen(false)} key={href} href={href} className={active ? 'active' : ''}><Icon size={18} /><span>{label}</span>{active && <ChevronRight size={15} />}</Link>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-profile">
        <Link href="/admin/profile"><Avatar name="D. Jayasuriya" /><span><b>D. Jayasuriya</b><small>Super Admin</small></span></Link>
        <button onClick={logout}><LogOut size={17} /> Log out</button>
      </div>
    </aside>
    <main className="main-content"><div className="content-wrap">{children}</div></main>
  </div>;
}
