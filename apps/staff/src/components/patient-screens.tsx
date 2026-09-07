'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText, Phone, Plus, Search, UserRound, Users } from 'lucide-react';
import { patients, Patient, visits } from '@/lib/demo-data';
import { Badge, Button, Card, MetricCard, PageHeader } from './ui';
import { RegisterPatientModal } from './patient-modal';

export function PatientsScreen() {
  const [records, setRecords] = useState(patients);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const filtered = useMemo(() => records.filter((patient) => {
    const match = `${patient.name} ${patient.nic}`.toLowerCase().includes(query.toLowerCase());
    if (filter === 'High priority') return match && patient.priority;
    if (filter === 'Follow-up due') return match && patient.type === 'Follow-up';
    if (filter === 'Recent visits') return match && patient.lastVisit === 'Today';
    return match;
  }), [filter, query, records]);
  const addPatient = (name: string, urgent: boolean) => {
    setRecords((items) => [{
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${items.length + 1}`,
      name,
      nic: `DEMO-${String(items.length + 1).padStart(4, '0')}`,
      phone: '+94 77 000 0000',
      age: 35,
      type: 'ECHO scan',
      lastVisit: 'Today',
      priority: urgent,
    }, ...items]);
  };
  return (
    <>
      <PageHeader eyebrow="Digital patient register" title="Patients" description="Search patient records, review visit history, or register a new walk-in." actions={<Button onClick={() => setModal(true)}><Plus className="h-4 w-4" />New patient</Button>} />
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Total patients" value="1,248" note="Active digital records" icon={Users} /><MetricCard label="New this week" value="34" note="+8 from last week" icon={UserRound} tone="cyan" /><MetricCard label="Follow-ups due" value="17" note="Next 14 days" icon={CalendarDays} tone="amber" /></div>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-slate-100 p-5"><div className="relative"><Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name or NIC number…" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10" /></div><div className="mt-4 flex flex-wrap gap-2">{['All', 'Recent visits', 'Follow-up due', 'High priority'].map((label) => <button key={label} onClick={() => setFilter(label)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${filter === label ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>)}</div></div>
        <div className="divide-y divide-slate-100">{filtered.map((patient) => <PatientRow key={patient.id} patient={patient} />)}{!filtered.length && <div className="p-12 text-center text-sm text-slate-500">No matching patient records.</div>}</div>
      </Card>
      <RegisterPatientModal open={modal} onClose={() => setModal(false)} onSaved={addPatient} />
    </>
  );
}

function PatientRow({ patient }: { patient: Patient }) {
  return <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{patient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{patient.name}</p><Badge tone={patient.type === 'Follow-up' ? 'amber' : patient.type === 'Referral' ? 'cyan' : 'teal'}>{patient.type}</Badge>{patient.priority && <Badge tone="rose">High priority</Badge>}</div><p className="mt-1 text-xs text-slate-500">NIC {patient.nic} · Last visit {patient.lastVisit}</p></div><Link href={`/patients/${patient.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open record <ChevronRight className="h-4 w-4" /></Link></div>;
}

export function PatientDetailScreen({ id }: { id: string }) {
  const patient = patients.find((item) => item.id === id) || patients[0]!;
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const save = () => { if (note.trim()) { setSaved(true); setTimeout(() => setSaved(false), 2500); } };
  return (
    <>
      <Link href="/patients" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-700"><ArrowLeft className="h-4 w-4" />Back to patient search</Link>
      <Card className="mb-5 overflow-hidden"><div className="h-2 bg-gradient-to-r from-teal-600 to-cyan-400" /><div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-teal-50 text-2xl font-black text-teal-700">{patient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{patient.name}</h1><Badge>Verified record</Badge><Badge tone="cyan">Stable · low risk</Badge></div><p className="mt-2 text-sm text-slate-500">NIC {patient.nic} · Age {patient.age} · 3 past visits</p><div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-teal-600" />{patient.phone}</span><span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-teal-600" />Digital record since 2026</span></div></div></div></Card>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-6"><h2 className="font-bold">Past visits</h2><p className="mt-1 text-xs text-slate-500">Complete visit and consultation history</p><div className="relative mt-6 space-y-0 before:absolute before:bottom-5 before:left-[15px] before:top-4 before:w-px before:bg-slate-200">{visits.map((visit) => <div key={visit.date} className="relative flex gap-4 pb-7"><span className="z-10 mt-1 h-8 w-8 shrink-0 rounded-full border-4 border-white bg-teal-600 ring-1 ring-teal-100" /><div className="flex-1 rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold">{visit.type}</p><p className="mt-1 text-xs text-slate-500">{visit.date} · {visit.doctor}</p></div><Badge tone={visit.status === 'Normal' ? 'teal' : visit.status === 'Review due' ? 'amber' : 'slate'}>{visit.status}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-600">{visit.summary}</p></div></div>)}</div></Card>
        <Card className="h-fit p-6"><p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700">Today’s visit</p><h2 className="mt-2 font-bold">Add consultation note</h2><p className="mt-2 text-xs leading-5 text-slate-500">Record findings, outcomes, or follow-up instructions for continuity of care.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={9} placeholder="Enter today’s consultation note…" className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10" />{saved && <p className="mt-3 flex items-center gap-2 text-sm font-medium text-teal-700"><CheckCircle2 className="h-4 w-4" />Note saved to patient record.</p>}<Button className="mt-4 w-full" onClick={save} disabled={!note.trim()}><CheckCircle2 className="h-4 w-4" />Save note</Button><p className="mt-3 flex items-center gap-1.5 text-center text-[11px] text-slate-400"><Clock3 className="h-3 w-3" />Draft stays on this device until saved.</p></Card>
      </div>
    </>
  );
}
