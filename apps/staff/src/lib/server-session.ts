import 'server-only';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { homeFor, isWebRole, workspaceFor, type Workspace } from './access-policy';
import { decodeSession, encodeSession, type WebSession } from './session-token';

export const SESSION_COOKIE = 'echoflow_web_session';
export const demoEnabled = process.env.NODE_ENV !== 'production' &&
  (process.env.NEXT_PUBLIC_FORCE_DEMO ?? 'true') === 'true';
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const globalSession = globalThis as typeof globalThis & { echoSessionSecret?: string };
function secret() {
  if (process.env.WEB_SESSION_SECRET && process.env.WEB_SESSION_SECRET.length >= 32) return process.env.WEB_SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('WEB_SESSION_SECRET must have at least 32 characters');
  return globalSession.echoSessionSecret ??= randomBytes(32).toString('hex');
}

export async function apiRequest(path: string, init: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, { ...init, cache: 'no-store', signal: AbortSignal.timeout(10000) });
}

export async function readSession(): Promise<WebSession | null> {
  const session = decodeSession((await cookies()).get(SESSION_COOKIE)?.value, secret(), demoEnabled);
  if (!session || session.demo) return session;
  try {
    // Recheck the authenticated account on the API, never a browser-supplied role.
    const response = await apiRequest('/auth/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
    if (!response.ok) return null;
    const account = await response.json();
    if (!isWebRole(account.role) || account.role !== session.role ||
        (account.adminId ?? account.staffId) !== session.accountId ||
        (workspaceFor(session.role) === 'staff' && account.status !== 'active')) return null;
    return session;
  } catch { return null; }
}

export async function saveSession(session: WebSession, keep: boolean) {
  (await cookies()).set(SESSION_COOKIE, encodeSession(session, secret()), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    ...(keep ? { maxAge: Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)) } : {}),
  });
}

export async function clearSession() { (await cookies()).delete(SESSION_COOKIE); }

export async function requireWorkspace(workspace: Workspace) {
  const session = await readSession();
  if (!session) redirect('/login');
  if (workspaceFor(session.role) !== workspace) redirect(homeFor(session.role));
  return session;
}

export function publicSession(session: WebSession | null) {
  return session ? { accountId: session.accountId, role: session.role, expiresAt: session.expiresAt, demo: session.demo } : null;
}
