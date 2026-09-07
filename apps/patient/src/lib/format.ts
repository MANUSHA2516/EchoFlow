export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  if (digits.startsWith('94') && digits.length >= 11) {
    const local = digits.slice(2);
    return `+94 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`.trim();
  }
  return e164;
}

export function toE164FromLocal(local: string): string {
  const digits = local.replace(/\D/g, '');
  if (digits.startsWith('94')) return `+${digits}`;
  if (digits.startsWith('0')) return `+94${digits.slice(1)}`;
  return `+94${digits}`;
}

export function localPhoneFromE164(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  if (digits.startsWith('94')) return digits.slice(2);
  return digits;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function formatDob(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDobInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  if (hours < 48) return 'Yesterday';
  return new Date(iso).toLocaleDateString();
}

export function formatVisitDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
