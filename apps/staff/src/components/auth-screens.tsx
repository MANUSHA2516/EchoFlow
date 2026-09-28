'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, ArrowLeft, BarChart3, CheckCircle2, Clock3, Eye, EyeOff, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Field } from './ui';
import { useAuth } from '@/lib/auth';

function BrandPanel() {
  const stats: Array<[string, string, LucideIcon]> = [
    ['18', 'In queue', Users],
    ['94%', 'Model confidence', BarChart3],
    ['99.9%', 'Uptime', ShieldCheck],
  ];
  return (
    <section className="staff-auth-hero">
      <div className="staff-auth-brand"><span className="staff-auth-brand-mark"><Activity size={20} /></span><span><b>EchoFlow</b><small>Staff Portal</small></span></div>
      <div className="staff-auth-message">
        <p className="staff-auth-kicker">Echocardiography Unit</p>
        <h1>A calmer queue.<br />Better patient flow.</h1>
        <p className="staff-auth-lede">Manage live queues, patient intake, and predictive demand from one secure clinical workspace.</p>
        <div className="staff-auth-stats">
          {stats.map(([value, label, Icon]) => <div key={label} className="staff-auth-stat"><Icon size={18} /><b>{value}</b><small>{label}</small></div>)}
        </div>
      </div>
      <p className="staff-auth-foot"><LockKeyhole size={15} />Access is logged and restricted to authorised staff.</p>
    </section>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, signIn } = useAuth();
  const [staffId, setStaffId] = useState('ECHO-STF-001');
  const [password, setPassword] = useState('EchoFlow!demo');
  const [keep, setKeep] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [sso, setSso] = useState('');

  useEffect(() => {
    if (authenticated) router.replace(searchParams.get('next') || '/');
  }, [authenticated, router, searchParams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await signIn(staffId, password, keep);
    if (ok) router.replace(searchParams.get('next') || '/');
    else setError('Staff ID or password is incorrect. API offline? Demo: ECHO-STF-001 / EchoFlow!demo');
  };

  return (
    <main className="staff-auth-page">
      <BrandPanel />
      <section className="staff-auth-side">
        <div className="staff-auth-content">
          <div className="staff-auth-mobile-brand"><span className="staff-auth-brand-mark"><Activity size={19} /></span><b>EchoFlow Staff</b></div>
          <p className="staff-eyebrow">Secure staff access</p>
          <h2 className="staff-auth-title">Welcome back</h2>
          <p className="staff-auth-description">Sign in to manage today&apos;s ECHO unit queue.</p>
          <form className="staff-auth-form" onSubmit={submit}>
            <Field label="Staff ID" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder="ECHO-STF-001" autoComplete="username" />
            <label className="staff-field"><span className="staff-field-label">Password</span><span className="staff-password-wrap"><input className="staff-input" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)} className="staff-password-toggle" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            <div className="staff-auth-options"><label><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />Keep me signed in</label><Link href="/forgot-password">Forgot password?</Link></div>
            {error && <p className="staff-auth-error">{error}</p>}
            <Button className="w-full" type="submit">Sign in securely</Button>
          </form>
          <div className="staff-auth-divider"><span />OR<span /></div>
          <Button variant="secondary" className="w-full" onClick={() => setSso('Hospital SSO is not configured for this demonstration.')}>Sign in with hospital SSO</Button>
          {sso && <p className="staff-auth-support">{sso}</p>}
          <p className="staff-auth-demo">Demo: ECHO-STF-001 · EchoFlow!demo</p>
        </div>
      </section>
    </main>
  );
}

export function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  return (
    <main className="staff-auth-page">
      <BrandPanel />
      <section className="staff-auth-side">
        <div className="staff-auth-content">
          <div className="staff-auth-mobile-brand"><span className="staff-auth-brand-mark"><Activity size={19} /></span><b>EchoFlow Staff</b></div>
          <Link href="/login" className="staff-auth-back"><ArrowLeft size={15} />Back to sign in</Link>
          {sent ? <div><span className="staff-auth-success-icon"><CheckCircle2 size={25} /></span><h1 className="staff-auth-title">Check your verified email</h1><p className="staff-auth-description">If the Staff ID exists, a secure reset link has been sent to the verified email address on file.</p><Button className="staff-auth-spaced-button w-full" onClick={() => setSent(false)}>Send again</Button></div> :
          <><p className="staff-eyebrow">Account recovery</p><h1 className="staff-auth-title">Reset your password</h1><p className="staff-auth-description">Enter your Staff ID. Reset instructions are only sent to your verified hospital email.</p><div className="staff-auth-recovery-form"><Field label="Staff ID" defaultValue="ECHO-STF-001" /><div className="staff-auth-notice"><Clock3 size={17} /><p>The reset link is single-use and expires after <strong>15 minutes</strong>.</p></div><Button className="w-full" onClick={() => setSent(true)}>Send reset link</Button></div></>}
          <p className="staff-auth-audit-note">Password reset requests are logged for audit and security review.</p>
        </div>
      </section>
    </main>
  );
}

export function ResetPasswordScreen() {
  const [done, setDone] = useState(false);
  return (
    <main className="staff-auth-page">
      <BrandPanel />
      <section className="staff-auth-side">
        <form className="staff-auth-content" onSubmit={(event) => { event.preventDefault(); setDone(true); }}>
          <div className="staff-auth-mobile-brand"><span className="staff-auth-brand-mark"><Activity size={19} /></span><b>EchoFlow Staff</b></div>
          <p className="staff-eyebrow">Secure reset</p>
          <h1 className="staff-auth-title">{done ? 'Password updated' : 'Create a new password'}</h1>
          {done ? <><p className="staff-auth-description">Your password has been updated. You can now return to the staff sign-in page.</p><Link href="/login" className="staff-auth-return">Return to sign in</Link></> :
          <><p className="staff-auth-description">Choose a strong password for Staff ID ECHO-STF-001.</p><div className="staff-auth-recovery-form"><Field label="New password" type="password" minLength={8} required /><Field label="Confirm new password" type="password" minLength={8} required /><div className="staff-auth-notice staff-auth-password-rule"><LockKeyhole size={17} /><p>Use at least 8 characters with uppercase, lowercase, a number, and a symbol.</p></div><Button className="w-full" type="submit">Update password</Button></div></>}
        </form>
      </section>
    </main>
  );
}
