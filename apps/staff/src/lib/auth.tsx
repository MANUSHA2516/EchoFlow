'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const SESSION_KEY = 'echoflow_staff_session';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  accessToken: string | null;
  signIn: (staffId: string, password: string, keep: boolean) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { staffId: string; accessToken?: string; refreshToken?: string };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const session = readSession();
    setAuthenticated(Boolean(session));
    setAccessToken(session?.accessToken ?? null);
    setReady(true);
  }, []);

  const signIn = async (staffId: string, password: string, keep: boolean) => {
    try {
      const res = await fetch(`${API_URL}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      });
      if (res.ok) {
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        const payload = { staffId, accessToken: data.accessToken, refreshToken: data.refreshToken, at: Date.now() };
        (keep ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(payload));
        setAccessToken(data.accessToken);
        setAuthenticated(true);
        return true;
      }
    } catch {
      /* fall through to offline demo */
    }
    const valid = staffId.trim().toUpperCase() === 'ECHO-STF-001' && password === 'EchoFlow!demo';
    if (valid) {
      (keep ? localStorage : sessionStorage).setItem(
        SESSION_KEY,
        JSON.stringify({ staffId, at: Date.now(), demo: true }),
      );
      setAccessToken(null);
      setAuthenticated(true);
    }
    return valid;
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setAccessToken(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ ready, authenticated, accessToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !authenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [authenticated, pathname, ready, router]);

  if (!ready || !authenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          Securing staff workspace…
        </div>
      </div>
    );
  }
  return children;
}
