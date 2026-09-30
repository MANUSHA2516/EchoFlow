'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowLeft, Bell, Camera, CheckCircle2, Clock3, Edit3, KeyRound, Lock, Timer, UserCheck } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { staff, weekly } from '@/lib/demo-data';
import { saveStaffProfile, useStaffProfile } from '@/lib/staff-profile';
import { Button, Card, Field, MetricCard, Modal, PageHeader } from './ui';

export function ProfileScreen() {
  const profile = useStaffProfile();
  const [accountPanel, setAccountPanel] = useState<'password' | 'notifications' | null>(null);
  const [accountSaved, setAccountSaved] = useState(false);
  const activity = [
    ['Marked A-008 complete', '12 minutes ago'], ['Called urgent patient A-012', '31 minutes ago'],
    ['Added a walk-in patient', '1 hour ago'], ['Updated consultation note', '2 hours ago'], ['Checked in for shift', '8:02 AM'],
  ];
  return (
    <>
      <PageHeader eyebrow="Staff account" title="My Profile" description="Your shift, performance, and account activity." />
      <Card className="mb-5 overflow-hidden"><div className="h-24 bg-gradient-to-r from-slate-950 via-teal-900 to-teal-700" /><div className="-mt-12 flex flex-col gap-5 px-6 pb-6 sm:flex-row sm:items-end"><span className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-teal-100 text-2xl font-black text-teal-800 shadow-sm">NB</span><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{profile.fullName}</h1><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />On shift</span></div><p className="mt-1 text-sm text-slate-500">{profile.role} · {profile.hospital}</p><p className="mt-2 text-xs font-bold text-teal-700">{profile.id}</p><p className="mt-1 text-sm text-slate-500">{profile.email} · {profile.phone}</p></div><Link href="/profile/edit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white"><Edit3 className="h-4 w-4" />Edit profile</Link></div></Card>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Patients served today" value="14" note="3 above daily average" icon={UserCheck} /><MetricCard label="Avg time / patient" value="13.8 min" note="1.2 min faster than target" icon={Timer} tone="cyan" /><MetricCard label="Shift hours today" value="8h 16m" note="Ends at 6:00 PM" icon={Clock3} tone="amber" /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card className="p-6"><h2 className="font-bold">Recent activity</h2><div className="mt-5 divide-y divide-slate-100">{activity.map(([title, time]) => <div key={title} className="flex items-start gap-3 py-3.5"><span className="mt-1 h-2 w-2 rounded-full bg-teal-500" /><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-slate-400">{time}</p></div></div>)}</div></Card>
        <div className="space-y-5"><Card className="p-6"><div className="flex justify-between"><div><h2 className="font-bold">Today’s shift</h2><p className="mt-1 text-xs text-slate-500">8:00 AM – 6:00 PM</p></div><span className="text-sm font-bold text-teal-700">82%</span></div><div className="mt-5 h-2.5 rounded-full bg-slate-100"><div className="h-full w-[82%] rounded-full bg-gradient-to-r from-teal-700 to-cyan-400" /></div><div className="mt-4 flex justify-between text-xs text-slate-500"><span>Checked in 8:02 AM</span><span>1h 44m remaining</span></div></Card><Card className="p-6"><h2 className="font-bold">Patients served this week</h2><div className="mt-4 h-[150px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly}><XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} /><Tooltip /><Bar dataKey="patients" radius={[5, 5, 0, 0]}>{weekly.map((item) => <Cell key={item.day} fill={item.day === 'Fri' ? '#13558f' : '#91d6e5'} />)}</Bar></BarChart></ResponsiveContainer></div></Card><div className="grid grid-cols-2 gap-3"><Button variant="secondary" onClick={() => { setAccountSaved(false); setAccountPanel('password'); }}><KeyRound className="h-4 w-4" />Password</Button><Button variant="secondary" onClick={() => { setAccountSaved(false); setAccountPanel('notifications'); }}><Bell className="h-4 w-4" />Notifications</Button></div></div>
      </div>
      <Modal open={accountPanel !== null} onClose={() => setAccountPanel(null)} title={accountPanel === 'password' ? 'Change password' : 'Notification settings'}>
        <div className="space-y-5 p-6">
          {accountPanel === 'password' ? <><Field label="Current password" type="password" /><Field label="New password" type="password" minLength={8} /><Field label="Confirm new password" type="password" minLength={8} /></> : <div className="space-y-3">{['Queue and urgent patient alerts', 'Shift reminders', 'Prediction and capacity alerts'].map((label) => <label key={label} className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-sm font-medium"><span>{label}</span><input type="checkbox" defaultChecked className="h-4 w-4 accent-teal-700" /></label>)}</div>}
          {accountSaved && <p className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800"><CheckCircle2 className="h-4 w-4" />Account settings updated.</p>}
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setAccountPanel(null)}>Cancel</Button><Button onClick={() => setAccountSaved(true)}>Save changes</Button></div>
        </div>
      </Modal>
    </>
  );
}

export function EditProfileScreen() {
  const profile = useStaffProfile();
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);
  const updatePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Choose a JPG or PNG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      saveStaffProfile({ ...profile, photoDataUrl: reader.result });
      setPhotoError('');
    };
    reader.onerror = () => setPhotoError('The image could not be loaded. Please try again.');
    reader.readAsDataURL(file);
  };
  const removePhoto = () => {
    saveStaffProfile({ ...profile, photoDataUrl: null });
    setPhotoError('');
  };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts[nameParts.length - 1] ?? firstName;
    saveStaffProfile({
      ...profile,
      fullName,
      name: nameParts.length > 1 ? `${firstName.charAt(0)}. ${lastName}` : fullName,
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      dob: String(formData.get('dob') ?? ''),
    });
    setSaved(true);
  };
  return (
    <>
      <Link href="/profile" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"><ArrowLeft className="h-4 w-4" />Back to my profile</Link>
      <PageHeader eyebrow="Staff account" title="Edit Profile" description="Update your personal contact information and profile photo." />
      <form onSubmit={save} className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <Card className="h-fit p-6"><h2 className="font-bold">Profile photo</h2><div className="mt-6 flex flex-col items-center text-center"><span className="grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-teal-100 text-3xl font-black text-teal-800">{profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="Staff profile" className="h-full w-full object-cover" /> : 'NB'}</span><input ref={photoInput} type="file" accept="image/png,image/jpeg" onChange={updatePhoto} className="sr-only" /><Button type="button" variant="secondary" className="mt-5" onClick={() => photoInput.current?.click()}><Camera className="h-4 w-4" />Upload new</Button><button type="button" onClick={removePhoto} className="mt-3 text-xs font-semibold text-rose-600">Remove photo</button><p className="mt-4 text-xs leading-5 text-slate-400">JPG or PNG. Maximum file size 2 MB.</p>{photoError && <p role="alert" className="mt-2 text-xs text-rose-600">{photoError}</p>}</div></Card>
        <div className="space-y-5"><Card className="p-6"><h2 className="font-bold">Personal information</h2><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Full name" name="fullName" defaultValue={profile.fullName} required /><Field label="Phone" name="phone" type="tel" defaultValue={profile.phone} required /><Field label="Email address" name="email" type="email" defaultValue={profile.email} required /><Field label="Date of birth" name="dob" type="date" defaultValue={profile.dob} /></div></Card><Card className="p-6"><div className="flex gap-3"><Lock className="h-5 w-5 text-slate-400" /><div><h2 className="font-bold">Work details</h2><p className="mt-1 text-xs text-slate-500">Managed by hospital admin and can’t be edited here.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Staff ID" defaultValue={staff.id} disabled /><Field label="Role" defaultValue="Technician" disabled /><div className="sm:col-span-2"><Field label="Department" defaultValue={staff.department} disabled /></div></div></Card>{saved && <p role="status" className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800"><CheckCircle2 className="h-4 w-4" />Profile changes saved.</p>}<div className="flex flex-wrap justify-between gap-3"><p className="text-xs text-slate-400">Last updated 7 September 2026 at 5:18 PM</p><div className="flex gap-3"><Link href="/profile" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold">Cancel</Link><Button type="submit">Save changes</Button></div></div></div>
      </form>
    </>
  );
}
