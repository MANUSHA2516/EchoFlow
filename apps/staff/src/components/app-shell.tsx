'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, BarChart3, Bell, CalendarDays, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Menu, Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useStaffProfile } from '@/lib/staff-profile';

const groups = [
  { label: 'Overview', links: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Operations', links: [{ href: '/queue', label: 'Queue management', icon: ClipboardList }, { href: '/patients', label: 'Patients', icon: Users }] },
  { label: 'Planning', links: [{ href: '/prediction', label: 'Prediction', icon: Activity }, { href: '/reports', label: 'Reports', icon: BarChart3 }] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const staff = useStaffProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <div className="staff-layout">
      {mobileOpen && <button className="staff-mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`staff-sidebar${mobileOpen ? ' staff-sidebar-open' : ''}`}>
        <div className="staff-brand">
          <Link href="/" className="staff-brand-link" onClick={() => setMobileOpen(false)}>
            <span className="staff-brand-mark"><Activity size={21} /></span>
            <span><b>EchoFlow</b><small>ECHO Unit · Staff</small></span>
          </Link>
          <button type="button" className="staff-close-nav" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="staff-secure-pill"><span className="staff-status-dot" />Secure staff workspace</div>
        <nav className="staff-navigation" aria-label="Staff portal">
          {groups.map((group) => <div className="staff-nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.links.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`staff-nav-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}><Icon size={18} /><span>{label}</span></Link>;
            })}
          </div>)}
        </nav>
        <div className="staff-sidebar-bottom">
          <div className="staff-system-status"><span className="staff-status-dot" />Systems operational</div>
          <Link href="/profile" className="staff-sidebar-profile" onClick={() => setMobileOpen(false)}><span className="staff-avatar">NB</span><span><b>{staff.name}</b><small>Technician · On shift</small></span></Link>
          <button onClick={logout} className="staff-logout"><LogOut size={16} />Log out</button>
        </div>
      </aside>
      <div className="staff-main">
        <header className="staff-topbar">
          <div className="staff-topbar-start">
            <button className="staff-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="staff-date"><CalendarDays size={16} /><span>Monday, 7 September 2026</span><i />5:18 PM</div>
          </div>
          <div className="staff-topbar-actions">
            <Link href="/patients" className="staff-topbar-icon" aria-label="Find a patient" title="Find a patient"><Search size={18} /></Link>
            <button className="staff-topbar-icon staff-notification" onClick={() => router.push('/queue')} aria-label="Queue notifications" title="Queue notifications"><Bell size={18} /><i /></button>
            <div className="staff-profile-menu">
              <button className="staff-profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
                <span className="staff-avatar">NB</span>
                <span className="staff-profile-copy"><b>{staff.name}</b><small>Technician · On shift</small></span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && <div className="staff-profile-dropdown"><Link href="/profile" onClick={() => setProfileOpen(false)}>My profile</Link><button onClick={logout}><LogOut size={15} />Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="staff-content">{children}</main>
      </div>
    </div>
  );
}
