'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { homeFor, workspaceFor, type WebRole, type Workspace } from './access-policy';

type Session = { accountId: string; role: WebRole; expiresAt: number; demo: boolean };
type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  role: WebRole | null;
  signIn: (accountId: string, password: string, keep: boolean, twoFactorCode?: string) => Promise<WebRole>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_EVENT = 'echoflow_web_auth_event';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/session', { cache: 'no-store' });
      const data = await response.json();
      setSession(response.ok ? data.session : null);
    } catch { setSession(null); }
    finally { setReady(true); }
  }, []);

  useEffect(() => {
    void refresh();
    const sync = (event: StorageEvent) => { if (event.key === AUTH_EVENT) void refresh(); };
    window.addEventListener('storage', sync);
    window.addEventListener('focus', refresh);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', refresh); };
  }, [refresh]);
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);

  const notify = () => { try { localStorage.setItem(AUTH_EVENT, `${Date.now()}:${Math.random()}`); } catch { /* Storage can be disabled. */ } };
  const signIn = async (accountId: string, password: string, keep: boolean, twoFactorCode?: string): Promise<WebRole> => {
    const response = await fetch('/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId, password, keep, twoFactorCode }) });
    const data = await response.json();
    if (!response.ok || !data.session) throw new Error(data.error ?? 'Unable to sign in.');
    setSession(data.session);
    setReady(true);
    notify();
    return data.session.role;
  };
  const signOut = async () => {
    const response = await fetch('/api/session', { method: 'DELETE' });
    if (!response.ok) throw new Error('Unable to sign out. Please try again.');
    setSession(null);
    notify();
  };
  return <AuthContext.Provider value={{ ready, authenticated: Boolean(session), role: session?.role ?? null, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthGate({ children, workspace = 'staff' }: { children: React.ReactNode; workspace?: Workspace }) {
  const { ready, authenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = authenticated && role !== null && workspaceFor(role) === workspace;
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { router.replace(`/login?next=${encodeURIComponent(pathname)}`); router.refresh(); }
    else if (role && !allowed) { router.replace(homeFor(role)); router.refresh(); }
  }, [authenticated, allowed, pathname, ready, role, router]);
  if (!ready || !allowed) return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="flex items-center gap-3 text-sm font-medium text-slate-600"><span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />Securing workspace...</div></div>;
  return children;
}
