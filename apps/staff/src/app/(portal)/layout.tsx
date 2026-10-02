import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/lib/auth';
import { requireWorkspace } from '@/lib/server-session';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspace('staff');
  return <AuthGate><AppShell>{children}</AppShell></AuthGate>;
}
