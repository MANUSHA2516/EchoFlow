'use client';

import { useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Clock3, Play, Plus, RotateCcw, SkipForward, UserRound } from 'lucide-react';
import { initialQueue, QueuePatient } from '@/lib/demo-data';
import { Badge, Button, Card, PageHeader } from './ui';
import { type Registration, usePatientRegister } from '@/lib/patient-register';
import { RegisterPatientModal } from './patient-modal';

export function QueueScreen() {
  const [waiting, setWaiting] = useState([...initialQueue].sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent)));
  const nextTicket = useRef(15);
  const { add } = usePatientRegister();
  const [current, setCurrent] = useState<QueuePatient>({ ticket: 'A-009', name: 'S. Silva', type: 'Routine ECHO scan', wait: 0 });
  const [stage, setStage] = useState(1);
  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState('');
  const next = (patient?: QueuePatient) => {
    const chosen = patient || waiting[0];
    if (!chosen) return;
    setWaiting((items) => items.filter((item) => item.ticket !== chosen.ticket));
    setCurrent(chosen);
    setStage(1);
    setMessage(`${chosen.ticket} · ${chosen.name} is now being called.`);
  };
  const done = () => {
    setStage(3);
    setMessage(`${current.ticket} marked complete.`);

  };
  const addWalkIn = (data: Registration) => {
    add(data);
    const ticket = `A-${String(nextTicket.current++).padStart(3, '0')}`;
    setWaiting((items) => [...items, { ticket, name: data.name, type: data.type, wait: 0, urgent: data.urgent }].sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent)));
  };

  return (
    <>
      <PageHeader eyebrow="Echo Room 1 · Live" title="Queue Management" description="Run the live patient queue and keep every visit moving." actions={<Button onClick={() => setModal(true)}><Plus className="h-4 w-4" />Add walk-in</Button>} />
      {message && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800"><CheckCircle2 className="h-4 w-4" />{message}</div>}
      <Card className="mb-5 grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0"><div className="p-5"><p className="text-xs font-semibold text-slate-500">Avg time / patient</p><p className="mt-1 text-xl font-bold">14 min</p></div><div className="p-5"><p className="text-xs font-semibold text-slate-500">Longest wait</p><p className="mt-1 text-xl font-bold text-amber-700">42 min</p></div><div className="p-5"><p className="text-xs font-semibold text-slate-500">Served today</p><p className="mt-1 text-xl font-bold text-teal-700">46 patients</p></div></Card>
      <Card className="mb-5 p-5"><div className="grid grid-cols-4">{['Checked in', 'Now serving', 'Scanning', 'Complete'].map((label, index) => <div key={label} className="relative flex flex-col items-center text-center"><div className={`absolute left-0 right-0 top-4 h-0.5 ${index <= stage ? 'bg-teal-600' : 'bg-slate-200'} ${index === 0 ? 'left-1/2' : ''} ${index === 3 ? 'right-1/2' : ''}`} /><span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold ${index < stage ? 'border-teal-600 bg-teal-600 text-white' : index === stage ? 'border-teal-600 bg-white text-teal-700 ring-4 ring-teal-50' : 'border-slate-200 bg-white text-slate-400'}`}>{index < stage ? <Check className="h-4 w-4" /> : index + 1}</span><span className={`mt-2 text-[11px] font-semibold sm:text-xs ${index === stage ? 'text-teal-700' : 'text-slate-500'}`}>{label}</span></div>)}</div></Card>
      <div className="grid gap-5 xl:grid-cols-[.9fr_1.25fr]">
        <Card className="overflow-hidden"><div className="flex items-center justify-between bg-slate-950 px-6 py-4 text-white"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-teal-300">Now serving</p><p className="mt-1 text-xs text-slate-400">Echo Room 1</p></div><Badge><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />Live</Badge></div><div className="p-7 text-center"><p className="text-6xl font-black tracking-tight text-teal-700">{current.ticket}</p><div className="mx-auto mt-5 grid h-14 w-14 place-items-center rounded-full bg-slate-100"><UserRound className="h-6 w-6 text-slate-500" /></div><h2 className="mt-3 text-xl font-bold">{current.name}</h2><p className="mt-1 text-sm text-slate-500">{current.type}</p><div className="mt-4 flex justify-center gap-2">{current.urgent && <Badge tone="rose"><AlertTriangle className="h-3 w-3" />Urgent</Badge>}<Badge tone="slate"><Clock3 className="h-3 w-3" />08:42 elapsed</Badge></div><div className="mt-7 grid grid-cols-2 gap-3"><Button variant="secondary" disabled={!waiting.length} onClick={() => next()}><SkipForward className="h-4 w-4" /> {stage === 3 ? 'Call next' : 'Skip'}</Button><Button disabled={stage === 3} onClick={done}><CheckCircle2 className="h-4 w-4" />Mark done</Button></div><Button variant="ghost" className="mt-3 w-full" disabled={stage === 3} onClick={() => setStage((value) => value === 1 ? 2 : 1)}><Play className="h-4 w-4" />{stage === 2 ? 'Back to now serving' : 'Start scanning'}</Button></div></Card>
        <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h2 className="font-bold">Waiting · {waiting.length} patients</h2><p className="mt-1 text-xs text-slate-500">Ordered by priority and check-in time</p></div><button onClick={() => setWaiting([...initialQueue].sort((a, b) => Number(!!b.urgent) - Number(!!a.urgent)))} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" title="Reset demo queue"><RotateCcw className="h-4 w-4" /></button></div><div className="divide-y divide-slate-100">{waiting.length ? waiting.map((patient, index) => <div key={patient.ticket} className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${patient.urgent ? 'bg-rose-50/60' : ''}`}><div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-black ${patient.urgent ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'}`}>{patient.ticket}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{patient.name}</p>{patient.urgent && <Badge tone="rose"><AlertTriangle className="h-3 w-3" />Urgent</Badge>}</div><p className="mt-1 text-xs text-slate-500">{patient.type} · Est. {patient.wait} min</p></div><div className="flex items-center gap-3"><span className="text-xs font-semibold text-slate-400">#{index + 1}</span>{patient.urgent ? <Button variant="danger" onClick={() => next(patient)}>Call next</Button> : <Button variant="secondary" onClick={() => next(patient)}>Call</Button>}</div></div>) : <div className="p-12 text-center text-sm text-slate-500">No patients waiting.</div>}</div></Card>
      </div>
      <RegisterPatientModal queue open={modal} onClose={() => setModal(false)} onSaved={addWalkIn} />
    </>
  );
}
