import { createHmac, timingSafeEqual } from 'node:crypto';
import { isWebRole, type WebRole } from './access-policy';

export type WebSession = {
  accountId: string;
  role: WebRole;
  expiresAt: number;
  demo: boolean;
  accessToken?: string;
  refreshToken?: string;
};

export function encodeSession(session: WebSession, secret: string): string {
  const value = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`;
}

export function decodeSession(token: string | undefined, secret: string, allowDemo: boolean): WebSession | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [value, signature] = parts;
    if (!value || !signature) return null;
    const expected = createHmac('sha256', secret).update(value).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const session = JSON.parse(Buffer.from(value, 'base64url').toString()) as WebSession;
    if (!isWebRole(session.role) || typeof session.accountId !== 'string' || !session.accountId ||
        !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now() || typeof session.demo !== 'boolean') return null;
    if (session.demo ? !allowDemo : typeof session.accessToken !== 'string' || !session.accessToken) return null;
    return session;
  } catch { return null; }
}
