/** Shared EchoFlow design tokens derived from Patient/Staff/Admin mockups. */
export const brand = {
  name: 'EchoFlow',
  patient: 'EchoFlow Patient',
  staff: 'EchoFlow Staff',
  admin: 'EchoFlow Admin',
  unitLabel: 'ECHO Unit',
} as const;

export const colors = {
  teal: '#0D9488',
  tealDark: '#0F766E',
  cyan: '#06B6D4',
  navy: '#0F172A',
  slate: '#64748B',
  amber: '#F59E0B',
  amberSoft: '#FEF3C7',
  green: '#10B981',
  red: '#EF4444',
  urgent: '#DC2626',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
} as const;

export const apiPaths = {
  v1: '/api/v1',
} as const;
