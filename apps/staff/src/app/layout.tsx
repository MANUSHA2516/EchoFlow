import type { Metadata } from 'next';
import './globals.css';
import { PatientRegisterProvider } from '@/lib/patient-register';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'EchoFlow Web',
  description: 'Staff and administrator portal for ECHO unit operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider><PatientRegisterProvider>{children}</PatientRegisterProvider></AuthProvider>
      </body>
    </html>
  );
}
