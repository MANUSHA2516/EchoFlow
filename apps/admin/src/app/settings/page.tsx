'use client';

import { BrainCircuit, Check, LockKeyhole, Save } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Card, PageHeader, Toggle } from '@/components/ui';

const rows = [
  ['View own room queue', true, true, true], ['Edit patient records', true, true, true], ['Add / remove staff', false, true, true],
  ['Manage other echo rooms', false, true, true], ['View audit log', false, false, true], ['Change AI & system settings', false, false, true],
];

export default function SettingsPage() {
  const [security, setSecurity] = useState({ twoFactor: true, autoLock: true });
  const [ai, setAi] = useState({ prediction: true, retrain: true, patientWait: true });
  const [saved, setSaved] = useState(false);
  return <AdminShell>
    <PageHeader eyebrow="System configuration" title="Settings" description="Control permissions, security policy and AI prediction behavior." actions={<button className="btn primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}><Save size={15} /> {saved ? 'Saved' : 'Save changes'}</button>} />
    <div className="settings-stack">
      <Card className="settings-card"><div className="card-head"><div><h2>Role permissions</h2><p>System access is scoped by the assigned role.</p></div></div><div className="table-wrap"><table className="permissions"><thead><tr><th>Capability</th><th>Technician</th><th>Room Lead</th><th>Super Admin</th></tr></thead><tbody>{rows.map(([label, ...values]) => <tr key={String(label)}><td><strong>{label}</strong></td>{values.map((value, i) => <td key={i}>{value ? <Check className="check" size={16} /> : <span className="dash">—</span>}</td>)}</tr>)}</tbody></table></div></Card>
      <div className="settings-grid">
        <Card className="settings-panel"><h2><LockKeyhole size={17} style={{ display: 'inline', marginRight: 8, color: '#0b817a' }} />Security</h2><p>Policies apply to all staff and administrators.</p>
          <Toggle checked={security.twoFactor} onChange={() => setSecurity({ ...security, twoFactor: !security.twoFactor })} label="Require two-factor authentication" detail="Required for all administrator accounts." />
          <Toggle checked={security.autoLock} onChange={() => setSecurity({ ...security, autoLock: !security.autoLock })} label="Auto-lock inactive sessions" detail="Sign out sessions after the idle timeout." />
          <label className="field"><span>Idle timeout</span><select defaultValue="15"><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option></select></label>
          <label className="field" style={{ marginTop: 13 }}><span>Password reset link expiry</span><select><option>15 minutes · single-use</option><option>30 minutes · single-use</option></select></label>
        </Card>
        <Card className="settings-panel"><h2><BrainCircuit size={17} style={{ display: 'inline', marginRight: 8, color: '#0b817a' }} />AI & prediction engine</h2><p>Operational queue forecasts only — not clinical diagnosis.</p>
          <div className="model-box"><BrainCircuit size={20} /><span><b>ECHO-ML v3.4.1 · Live</b><small>Last retrained 02 Sep 2026 · synthetic demo provenance</small></span></div>
          <Toggle checked={ai.prediction} onChange={() => setAi({ ...ai, prediction: !ai.prediction })} label="Enable AI queue prediction" detail="Forecast volume, peaks and operational wait." />
          <Toggle checked={ai.retrain} onChange={() => setAi({ ...ai, retrain: !ai.retrain })} label="Auto-retrain model weekly" detail="Scheduled Sundays at 02:00." />
          <Toggle checked={ai.patientWait} onChange={() => setAi({ ...ai, patientWait: !ai.patientWait })} label="Show predicted wait to patients" detail="Display estimates in patient queue views." />
        </Card>
      </div>
    </div>
  </AdminShell>;
}
