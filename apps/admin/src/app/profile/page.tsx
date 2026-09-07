'use client';

import { CalendarDays, Edit3, KeyRound, LogOut, Mail, MapPin, Phone, ShieldCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Avatar, Card, PageHeader, Status } from '@/components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: 'D. Jayasuriya', email: 'd.jayasuriya@echoflow.demo', phone: '+94 77 000 0014', dob: '1984-08-16' });
  useEffect(() => {
    const saved = localStorage.getItem('echoflow-admin-profile');
    if (saved) setProfile(JSON.parse(saved) as typeof profile);
  }, []);
  function logout() { localStorage.removeItem('echoflow-admin-session'); router.push('/login'); }
  return <AdminShell>
    <PageHeader eyebrow="Administrator account" title="My Profile" description="Your account, security and recent administrative activity." />
    <Card className="profile-hero"><Avatar name={profile.name} large /><div><h2>{profile.name}</h2><p>Super Admin · ECHO-ADM-014</p><p>Member since January 2024 · Last login today at 8:02 AM</p></div><Status tone="green">Verified</Status><Link className="btn secondary" href="/profile/edit"><Edit3 size={15} /> Edit profile</Link></Card>
    <div className="kpi-grid">{[['Rooms overseen', '6'], ['Staff managed', '12'], ['Approvals this week', '4'], ['Member since', '2024']].map(([label, value]) => <Card className="kpi" key={label}><h3>{value}</h3><p>{label}</p></Card>)}</div>
    <div className="profile-grid">
      <Card className="profile-card"><h2>Recent activity</h2>{[['Approved M. Fernando’s staff account', 'Today · 10:42 AM'], ['Updated Echo Room 2 operating hours', 'Today · 9:18 AM'], ['Changed AI prediction settings', 'Yesterday · 4:26 PM'], ['Suspended an inactive staff account', '04 Sep · 11:05 AM']].map(([text, time]) => <div className="activity-row" key={text}><i /><div><p>{text}</p><small>{time}</small></div></div>)}</Card>
      <div style={{ display: 'grid', gap: 17 }}>
        <Card className="profile-card"><h2>Contact & details</h2><div className="detail-row"><Mail size={16} /><div><span>Email</span><b>{profile.email}</b></div></div><div className="detail-row"><Phone size={16} /><div><span>Phone</span><b>{profile.phone}</b></div></div><div className="detail-row"><CalendarDays size={16} /><div><span>Date of birth</span><b>16 August 1984</b></div></div><div className="detail-row"><MapPin size={16} /><div><span>Hospital</span><b>General Hospital · ECHO Unit</b></div></div></Card>
        <Card className="profile-card"><h2>Security</h2><div className="detail-row"><ShieldCheck size={16} /><div><span>Two-factor authentication</span><b>Enabled</b></div></div><div className="detail-row"><KeyRound size={16} /><div><span>Password</span><b>Changed 32 days ago</b></div></div><div className="detail-row"><Smartphone size={16} /><div><span>Active sessions</span><b>2 hospital devices</b></div></div><button className="btn danger" style={{ width: '100%', marginTop: 15 }} onClick={logout}><LogOut size={15} /> Log out of this account</button></Card>
      </div>
    </div>
  </AdminShell>;
}
