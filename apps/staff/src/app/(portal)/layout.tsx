import { AppShell } from '@/components/app-shell';
import { AuthGate } from '@/lib/auth';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate><AppShell>{children}</AppShell></AuthGate>;
}
