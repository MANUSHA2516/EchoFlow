'use client';

import { Activity, ArrowRight, BrainCircuit, Building2, Eye, EyeOff, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('ECHO-ADM-014');
  const [password, setPassword] = useState('EchoFlow!demo');
  const [code, setCode] = useState('123456');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('echoflow-admin-session')) router.replace('/');
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          password,
          twoFactorCode: code,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        localStorage.setItem(
          'echoflow-admin-session',
          JSON.stringify({ accessToken: data.accessToken, refreshToken: data.refreshToken }),
        );
        router.push('/');
        return;
      }
    } catch {
      /* offline demo fallback */
    }
    if (
      adminId.trim().toUpperCase() === 'ECHO-ADM-014' &&
      password === 'EchoFlow!demo' &&
      code === '123456'
    ) {
      localStorage.setItem('echoflow-admin-session', JSON.stringify({ demo: true }));
      router.push('/');
      return;
    }
    setError('Check your Admin ID, password, and 6-digit access code.');
    setBusy(false);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-brand">
          <span>
            <Activity size={22} />
          </span>
          <b>EchoFlow</b>
          <small>ECHO Unit Admin</small>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Secure unit administration</p>
          <h1>Oversee every echo room, technician and AI-predicted queue in one place.</h1>
          <p>
            Make faster operational decisions with a real-time view across your entire ECHO Unit.
          </p>
          <div className="hero-features">
            <div>
              <Building2 />
              <span>
                <b>6 connected rooms</b>
                <small>Live room and queue status</small>
              </span>
            </div>
            <div>
              <Users />
              <span>
                <b>Role-based access</b>
                <small>Protected staff governance</small>
              </span>
            </div>
            <div>
              <BrainCircuit />
              <span>
                <b>AI-assisted planning</b>
                <small>Operational demand forecasts</small>
              </span>
            </div>
          </div>
        </div>
        <p className="hero-foot">
          <ShieldCheck size={14} /> Encrypted · Audited · Hospital managed
        </p>
      </section>
      <section className="login-form-side">
        <form className="login-form" onSubmit={submit}>
          <div className="mobile-login-brand">
            <Activity size={21} />
            <b>EchoFlow Admin</b>
          </div>
          <span className="login-lock">
            <LockKeyhole size={20} />
          </span>
          <p className="eyebrow">Administrator portal</p>
          <h2>Sign in to ECHO Admin</h2>
          <p>Use your hospital-issued administrator credentials.</p>
          <label className="field">
            <span>Admin ID</span>
            <input
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="ECHO-ADM-000"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="password-wrap">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <label className="field">
            <span>Two-factor access code</span>
            <input
              className="code-input"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
            />
            <small className="field-help">
              Enter the code from your authenticator app. Demo: 123456
            </small>
          </label>
          {error && <p className="login-error">{error}</p>}
          <button className="btn primary login-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in securely'} <ArrowRight size={16} />
          </button>
          <div className="demo-box">
            <b>Demo credentials</b>
            <span>Admin ID: ECHO-ADM-014</span>
            <span>Password: EchoFlow!demo · 2FA: 123456</span>
          </div>
          <p className="support-copy">Trouble signing in? Contact hospital IT support.</p>
        </form>
      </section>
    </main>
  );
}
