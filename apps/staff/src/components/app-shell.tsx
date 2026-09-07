'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Bell, CalendarDays, ChartNoAxesCombined, ChevronDown, ClipboardList, LayoutDashboard, LogOut, Menu, Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { staff } from '@/lib/demo-data';
import { useAuth } from '@/lib/auth';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/queue', label: 'Queue management', icon: ClipboardList },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/prediction', label: 'Prediction', icon: Activity },
  { href: '/reports', label: 'Reports', icon: ChartNoAxesCombined },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const logout = () => {
    signOut();
    router.replace('/login');
  };

  const sidebar = (
    <aside className="flex h-full w-[264px] flex-col bg-slate-950 text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 text-white"><Activity className="h-6 w-6" /></span>
        <div><p className="text-lg font-bold tracking-tight">EchoFlow</p><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-teal-300">Staff Portal</p></div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}><Icon className="h-5 w-5" />{label}</Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />Systems operational</div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" />Log out</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f8fa]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 flex bg-slate-950/40 lg:hidden"><div>{sidebar}</div><button className="m-4 grid h-10 w-10 place-items-center rounded-xl bg-white" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div>}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 p-2.5 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><CalendarDays className="h-4 w-4 text-teal-600" /><span>Monday, 7 September 2026</span><span className="text-slate-300">•</span><span>5:18 PM</span></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 sm:block"><Search className="h-5 w-5" /></button>
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
            <div className="relative">
              <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100" onClick={() => setProfileOpen(!profileOpen)}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-sm font-bold text-teal-800">NB</span>
                <span className="hidden text-left md:block"><span className="block text-sm font-semibold">{staff.name}</span><span className="block text-[11px] text-slate-500">Technician · On shift</span></span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
              </button>
              {profileOpen && <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><Link href="/profile" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50">My profile</Link><button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" />Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
