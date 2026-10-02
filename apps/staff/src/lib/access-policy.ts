export type WebRole = 'technician' | 'room_lead' | 'super_admin';
export type Workspace = 'staff' | 'admin';

export function isWebRole(value: unknown): value is WebRole {
  return value === 'technician' || value === 'room_lead' || value === 'super_admin';
}

export function workspaceFor(role: WebRole): Workspace {
  return role === 'super_admin' ? 'admin' : 'staff';
}

export function homeFor(role: WebRole): string {
  return workspaceFor(role) === 'admin' ? '/admin' : '/';
}

// Only known, same-origin routes belonging to this account's workspace are eligible.
export function destinationFor(role: WebRole, next?: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || /[\\%\x00-\x20]/.test(next)) return homeFor(role);
  const path = next.split(/[?#]/)[0] ?? ''; 
  const allowed = workspaceFor(role) === 'admin'
    ? /^\/admin(?:\/(?:rooms|staff|insights|audit|settings|profile(?:\/edit)?))?\/?$/
    : /^(?:\/|\/(?:queue|patients(?:\/[a-zA-Z0-9_-]+)?|prediction|reports|profile(?:\/edit)?)\/?)$/;
  return allowed.test(path) ? next : homeFor(role);
}
