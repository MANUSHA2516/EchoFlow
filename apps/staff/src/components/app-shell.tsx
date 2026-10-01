'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, BarChart3, Bell, CalendarDays, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Menu, Search, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

  const [now, setNow] = useState<Date | null>(null);
  const profileMenu = useRef<HTMLDivElement>(null);
  const initials = staff.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2);
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(new Date()), 0);
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!profileMenu.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setProfileOpen(false); setMobileOpen(false); }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, []);

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <div className="staff-layout">
      <a href="#staff-main" className="staff-skip-link">Skip to content</a>
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
          <Link href="/profile" className="staff-sidebar-profile" onClick={() => setMobileOpen(false)}><span className="staff-avatar">{staff.photoDataUrl ? <Image src={staff.photoDataUrl} alt="" width={38} height={38} unoptimized /> : initials}</span><span><b>{staff.name}</b><small>Technician · On shift</small></span></Link>
          <button onClick={logout} className="staff-logout"><LogOut size={16} />Log out</button>
        </div>
      </aside>
      <div className="staff-main">
        <header className="staff-topbar">
          <div className="staff-topbar-start">
            <button className="staff-mobile-menu" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="staff-date"><CalendarDays size={16} /><span>{now?.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) ?? 'Staff workspace'}</span><i />{now?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
          </div>
          <div className="staff-topbar-actions">
            <Link href="/patients" className="staff-topbar-icon" aria-label="Find a patient" title="Find a patient"><Search size={18} /></Link>
            <button className="staff-topbar-icon staff-notification" onClick={() => router.push('/queue')} aria-label="Queue notifications" title="Queue notifications"><Bell size={18} /><i /></button>
            <div className="staff-profile-menu" ref={profileMenu}>
              <button className="staff-profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-label="Account options" aria-expanded={profileOpen}>
                <span className="staff-avatar">{staff.photoDataUrl ? <Image src={staff.photoDataUrl} alt="" width={38} height={38} unoptimized /> : initials}</span>
                <span className="staff-profile-copy"><b>{staff.name}</b><small>Technician · On shift</small></span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && <div className="staff-profile-dropdown"><Link href="/profile" onClick={() => setProfileOpen(false)}>My profile</Link><button onClick={logout}><LogOut size={15} />Log out</button></div>}
            </div>
          </div>
        </header>
        <main id="staff-main" tabIndex={-1} className="staff-content">{children}</main>
      </div>
    </div>
  );
}
