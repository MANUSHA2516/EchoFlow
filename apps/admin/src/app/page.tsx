'use client';

import { AlertTriangle, BrainCircuit, Building2, CheckCircle2, Download, ScanLine, Sparkles, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { AddTechnicianModal } from '@/components/AdminModals';
import { Card, PageHeader, Status } from '@/components/ui';
import { alerts, rooms, type Staff } from '@/lib/demo-data';

export default function HomePage() {
  const [addTech, setAddTech] = useState(false);
  const [addedTechnician, setAddedTechnician] = useState<Staff | null>(null);
  const kpis = [
    { label: 'Active technicians', value: '12', detail: '2 more than yesterday', icon: Users },
    { label: 'Patients scanned today', value: '68', detail: '↑ 12% from last Monday', icon: ScanLine },
    { label: 'Echo rooms live', value: '5 / 6', detail: '1 portable unit off-site', icon: Building2 },
    { label: 'AI prediction accuracy', value: '92%', detail: 'Last 30 days · demo', icon: BrainCircuit },
  ];
  function exportOverview() {
    const rows = ['Room,Status,Queue,Average wait', ...rooms.map((r) => `${r.name},${r.status},${r.queue},${r.wait} min`)];
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'echoflow-unit-overview.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return <AdminShell>
    <PageHeader eyebrow="Monday · 07 September 2026" title="Today’s Unit Overview" description="A live view of people, rooms and predicted demand across the ECHO Unit." actions={<><button className="btn secondary" onClick={exportOverview}><Download size={15} /> Export</button><button className="btn primary" onClick={() => setAddTech(true)}><UserPlus size={15} /> Add technician</button></>} />
    {addedTechnician && <div className="notice" style={{ marginBottom: 17 }}><CheckCircle2 size={18} /><span><b>{addedTechnician.name} added to today’s roster</b><small>{addedTechnician.role} · {addedTechnician.room} · invite pending</small></span></div>}
    <div className="kpi-grid">{kpis.map(({ label, value, detail, icon: Icon }) => <Card className="kpi" key={label}><div className="kpi-top"><span className="kpi-icon"><Icon size={18} /></span><small>LIVE</small></div><h3>{value}</h3><p className={detail.startsWith('↑') ? 'trend-up' : ''}>{label}<br /><span>{detail}</span></p></Card>)}</div>
    <Card className="insight"><span><Sparkles size={21} /></span><div className="insight-content"><p className="eyebrow">AI insight · ECHO-ML v3.4.1</p><h2>Plan one extra technician between 1:30 and 3:00 PM</h2><p>Today’s arrivals are forecast to peak at 17 patients per hour. Adding coverage to Stress Echo Suite could keep the average wait below the 20 minute SLA. <a href="/insights">View reasoning →</a></p></div></Card>
    <div className="dashboard-grid">
      <Card><div className="card-head"><div><h2>Echo room status</h2><p>Live staffing and queue load by room</p></div><a className="text-link" href="/rooms">View all rooms →</a></div><div className="table-wrap"><table><thead><tr><th>Room</th><th>Technician</th><th>Queue</th><th>Avg wait</th><th>Status</th></tr></thead><tbody>{rooms.slice(0, 5).map((r) => <tr key={r.name}><td><strong>{r.name}</strong><small>{r.location}</small></td><td>{r.lead}</td><td><strong>{r.queue}</strong></td><td>{r.wait} min</td><td><Status tone={r.status === 'Live' ? 'green' : 'amber'}>{r.status}</Status></td></tr>)}</tbody></table></div></Card>
      <Card><div className="card-head"><div><h2>System alerts</h2><p>Items needing your attention</p></div><Status tone="red">3 open</Status></div><div className="alerts">{alerts.map((a) => <div className="alert-item" key={a.title}><span className={`alert-icon ${a.tone}`}><AlertTriangle size={15} /></span><div><h3>{a.title}</h3><p>{a.detail}</p><time>{a.time}</time></div></div>)}</div></Card>
    </div>
    {addTech && <AddTechnicianModal onClose={() => setAddTech(false)} onAdd={setAddedTechnician} />}
  </AdminShell>;
}
