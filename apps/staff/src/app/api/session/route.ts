import { NextRequest, NextResponse } from 'next/server';
import { apiRequest, clearSession, demoEnabled, publicSession, readSession, saveSession } from '@/lib/server-session';
import { isWebRole, workspaceFor } from '@/lib/access-policy';
import type { WebSession } from '@/lib/session-token';

export const runtime = 'nodejs';
const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return origin === request.nextUrl.origin && request.headers.get('sec-fetch-site') !== 'cross-site';
}

export async function GET() { return reply({ session: publicSession(await readSession()) }); }

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return reply({ error: 'Invalid request origin.' }, 403);
  let input;
  try { input = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }
  if (!input || typeof input.accountId !== 'string' || typeof input.password !== 'string' ||
      input.accountId.length > 80 || input.password.length > 256) return reply({ error: 'Enter your account ID and password.' }, 400);
  const accountId = input.accountId.trim().toUpperCase();
  const admin = accountId.startsWith('ECHO-ADM-');
  let session: WebSession;
  if (demoEnabled) {
    const valid = input.password === 'EchoFlow!demo' && (admin
      ? accountId === 'ECHO-ADM-014' && input.twoFactorCode === '123456'
      : accountId === 'ECHO-STF-001');
    if (!valid) return reply({ error: 'Check your account ID, password, and administrator access code.' }, 401);
    session = { accountId, role: admin ? 'super_admin' : 'technician', demo: true, expiresAt: Date.now() + (input.keep === true ? 7 : 1) * 86400000 };
  } else {
    try {
      const response = await apiRequest(`/auth/${admin ? 'admin' : 'staff'}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin ? { adminId: accountId, password: input.password, twoFactorCode: input.twoFactorCode }
          : { staffId: accountId, password: input.password }),
      });
      if (!response.ok) return reply({ error: 'Sign-in failed. Check your credentials and access code.' }, response.status >= 500 ? 503 : 401);
      const tokens = await response.json();
      if (typeof tokens.accessToken !== 'string') return reply({ error: 'Unable to verify this account.' }, 401);
      const me = await apiRequest('/auth/me', { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
      if (!me.ok) return reply({ error: 'Unable to verify this account.' }, 401);
      const account = await me.json();
      if (!isWebRole(account.role) || workspaceFor(account.role) !== (admin ? 'admin' : 'staff') ||
          (account.adminId ?? account.staffId) !== accountId || (!admin && account.status !== 'active')) {
        return reply({ error: 'This account does not have web portal access.' }, 403);
      }
      const payload = JSON.parse(Buffer.from(tokens.accessToken.split('.')[1], 'base64url').toString());
      if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) return reply({ error: 'Your session has expired.' }, 401);
      session = { accountId, role: account.role, demo: false, accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, expiresAt: payload.exp * 1000 };
    } catch { return reply({ error: 'Sign-in service is unavailable. Please try again.' }, 503); }
  }
  await saveSession(session, input.keep === true);
  return reply({ session: publicSession(session) });
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return reply({ error: 'Invalid request origin.' }, 403);
  const session = await readSession();
  await clearSession();
  if (session?.refreshToken) {
    try { await apiRequest('/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: session.refreshToken }) }); }
    catch { /* The local session has already been removed. */ }
  }
  return reply({ session: null });
}
