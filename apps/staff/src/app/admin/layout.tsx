import type { Metadata } from 'next';
import { AuthGate } from '@/lib/auth';
import { requireWorkspace } from '@/lib/server-session';
import './admin.css';

export const metadata: Metadata = { title: 'EchoFlow Admin' };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireWorkspace('admin');
  return <AuthGate workspace="admin"><div className="admin-workspace">{children}</div></AuthGate>;
}
