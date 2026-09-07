'use client';

import { Check, Clock3, Download, Filter, Search, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Card, PageHeader } from '@/components/ui';
import { auditEvents } from '@/lib/demo-data';

export default function AuditPage() {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const events = useMemo(() => auditEvents.filter((e) => (category === 'All' || e.category === category) && `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  function exportLog() {
    const csv = ['Time,Category,Actor,Action,Target', ...events.map((e) => [e.time, e.category, e.actor, e.action, e.target].join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'echoflow-audit-log.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return <AdminShell>
    <PageHeader eyebrow="Accountability & governance" title="Audit Log" description="A timestamped record of activity across the EchoFlow system." actions={<button className="btn secondary" onClick={exportLog}><Download size={15} /> Export log</button>} />
    <div className="toolbar"><div className="searchbox"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff member, action or record…" /></div><div className="chips">{['All', 'Staff actions', 'Security', 'AI & system'].map((x) => <button className={`chip ${category === x ? 'active' : ''}`} onClick={() => setCategory(x)} key={x}>{x}</button>)}</div></div>
    <div className="audit-layout">
      <Card><div className="card-head"><div><h2>Activity timeline</h2><p>{events.length} events · Latest first</p></div></div><div className="timeline"><p className="day-label">Today · 07 September 2026</p>{events.map((e) => <div className="event" key={`${e.time}-${e.action}`}><span className={`event-icon ${e.tone}`}>{e.tone === 'danger' ? <ShieldAlert size={14} /> : e.tone === 'info' ? <Sparkles size={14} /> : <Check size={14} />}</span><div><h3><b>{e.actor}</b> {e.action}</h3><p>{e.target}</p></div><time>{e.time}</time></div>)}</div></Card>
      <Card className="filter-card"><h3><Filter size={14} style={{ display: 'inline', marginRight: 6 }} />Time range</h3><label className="field"><span>Show events from</span><select><option>Last 24 hours</option><option>Last 7 days</option><option>Last 30 days</option><option>Custom range</option></select></label><div className="notice"><Clock3 size={17} /><span><b>Audit records are retained</b><small>Security and access events cannot be altered by staff.</small></span></div></Card>
    </div>
  </AdminShell>;
}
