'use client';

import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Card, PageHeader } from '@/components/ui';

const defaultProfile = {
  name: 'D. Jayasuriya',
  email: 'd.jayasuriya@echoflow.demo',
  phone: '+94 77 000 0014',
  dob: '1984-08-16',
};

export default function EditProfilePage() {
  const router = useRouter();
  const [draft, setDraft] = useState(defaultProfile);

  useEffect(() => {
    const saved = localStorage.getItem('echoflow-admin-profile');
    if (saved) setDraft(JSON.parse(saved) as typeof defaultProfile);
  }, []);

  function save() {
    localStorage.setItem('echoflow-admin-profile', JSON.stringify(draft));
    router.push('/profile');
  }

  return <AdminShell>
    <PageHeader eyebrow="My profile" title="Edit Profile" description="Update personal information. Work access is managed by the system." actions={<><button className="btn secondary" onClick={() => router.push('/profile')}>Cancel</button><button className="btn primary" onClick={save}><Save size={15} /> Save changes</button></>} />
    <div className="profile-grid">
      <Card className="profile-card"><h2>Personal information</h2><div className="form-grid two">
        <label className="field"><span>Full name</span><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
        <label className="field"><span>Email address</span><input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
        <label className="field"><span>Phone</span><input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label>
        <label className="field"><span>Date of birth</span><input type="date" value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} /></label>
      </div></Card>
      <Card className="profile-card"><h2>Work details</h2><p className="muted">Managed by the system and not editable from your profile.</p><div className="form-grid">
        <label className="field"><span>Admin ID · Managed by system</span><input readOnly value="ECHO-ADM-014" /></label>
        <label className="field"><span>Department · Managed by system</span><input readOnly value="ECHO Unit Admin" /></label>
        <label className="field"><span>Role</span><input readOnly value="Super Admin" /></label>
        <label className="field"><span>Access level</span><input readOnly value="All echo rooms" /></label>
      </div></Card>
    </div>
  </AdminShell>;
}
