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
    <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-500"><Activity /></span><div><p className="text-xl font-bold">EchoFlow</p><p className="text-xs uppercase tracking-[.2em] text-teal-300">Staff Portal</p></div></div>
      <div className="relative max-w-lg">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">Echocardiography Unit</p>
        <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight">A calmer queue.<br />Better patient flow.</h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Manage live queues, patient intake, and predictive demand from one secure clinical workspace.</p>
        <div className="mt-10 grid grid-cols-3 gap-3">
          {stats.map(([value, label, Icon]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"><Icon className="mb-4 h-5 w-5 text-teal-300" /><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
        </div>
      </div>
      <p className="relative flex items-center gap-2 text-xs text-slate-400"><LockKeyhole className="h-4 w-4 text-teal-400" />Access is logged and restricted to authorised staff.</p>
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
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <BrandPanel />
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><Activity /></span><p className="text-xl font-bold">EchoFlow Staff</p></div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Secure staff access</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage today&apos;s ECHO unit queue.</p>
          <form className="mt-9 space-y-5" onSubmit={submit}>
            <Field label="Staff ID" value={staffId} onChange={(e) => setStaffId(e.target.value)} placeholder="ECHO-STF-001" autoComplete="username" />
            <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Password</span><span className="relative block"><input className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-12 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-400">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
            <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-600"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-4 w-4 accent-teal-700" />Keep me signed in</label><Link href="/forgot-password" className="font-semibold text-teal-700 hover:text-teal-800">Forgot password?</Link></div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button className="w-full" type="submit">Sign in securely</Button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
          <Button variant="secondary" className="w-full" onClick={() => setSso('Hospital SSO is not configured for this demonstration.')}>Sign in with hospital SSO</Button>
          {sso && <p className="mt-3 text-center text-xs text-slate-500">{sso}</p>}
          <p className="mt-8 text-center text-xs text-slate-400">Demo: ECHO-STF-001 · EchoFlow!demo</p>
        </div>
      </section>
    </main>
  );
}

export function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <BrandPanel />
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
          {sent ? <div><span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700"><CheckCircle2 className="h-7 w-7" /></span><h1 className="mt-6 text-3xl font-bold">Check your verified email</h1><p className="mt-3 leading-6 text-slate-500">If the Staff ID exists, a secure reset link has been sent to the verified email address on file.</p><Button className="mt-8 w-full" onClick={() => setSent(false)}>Send again</Button></div> :
          <><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Account recovery</p><h1 className="mt-3 text-3xl font-bold">Reset your password</h1><p className="mt-3 leading-6 text-slate-500">Enter your Staff ID. Reset instructions are only sent to your verified hospital email.</p><div className="mt-8 space-y-5"><Field label="Staff ID" defaultValue="ECHO-STF-001" /><div className="flex gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900"><Clock3 className="mt-0.5 h-5 w-5 shrink-0" /><p>The reset link is single-use and expires after <strong>15 minutes</strong>.</p></div><Button className="w-full" onClick={() => setSent(true)}>Send reset link</Button></div></>}
          <p className="mt-10 text-xs text-slate-400">Password reset requests are logged for audit and security review.</p>
        </div>
      </section>
    </main>
  );
}

export function ResetPasswordScreen() {
  const [done, setDone] = useState(false);
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_.92fr]">
      <BrandPanel />
      <section className="flex items-center justify-center px-6 py-12">
        <form className="w-full max-w-md" onSubmit={(event) => { event.preventDefault(); setDone(true); }}>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Secure reset</p>
          <h1 className="mt-3 text-3xl font-bold">{done ? 'Password updated' : 'Create a new password'}</h1>
          {done ? <><p className="mt-3 leading-6 text-slate-500">Your password has been updated. You can now return to the staff sign-in page.</p><Link href="/login" className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-700 text-sm font-semibold text-white">Return to sign in</Link></> :
          <><p className="mt-3 leading-6 text-slate-500">Choose a strong password for Staff ID ECHO-STF-001.</p><div className="mt-8 space-y-5"><Field label="New password" type="password" minLength={8} required /><Field label="Confirm new password" type="password" minLength={8} required /><div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">Use at least 8 characters with uppercase, lowercase, a number, and a symbol.</div><Button className="w-full" type="submit">Update password</Button></div></>}
        </form>
      </section>
    </main>
  );
}
