'use client';

import Link from 'next/link';
import { Activity, ArrowRight, BrainCircuit, Clock3, Download, Gauge, Lightbulb, Sparkles, TrendingDown, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { forecast, inflow, weekly } from '@/lib/demo-data';
import { Badge, Button, Card, MetricCard, PageHeader } from './ui';

export function DashboardScreen() {
  return (
    <>
      <PageHeader eyebrow="Monday · Live unit view" title="Today’s Overview" description="Good afternoon, N. Bandara. Here’s how the ECHO unit is moving today." actions={<Badge><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Live updates</Badge>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="In queue" value="18" note="4 patients checked in" icon={Users} />
        <MetricCard label="Served today" value="46" note="+12% from last Monday" icon={UserCheck} tone="cyan" />
        <MetricCard label="Average wait" value="24 min" note="6 min under target" icon={Clock3} tone="amber" />
        <MetricCard label="Predicted peak" value="11–12 PM" note="18 patients expected" icon={TrendingUp} tone="rose" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_.75fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">Predicted patient inflow</h2><p className="mt-1 text-xs text-slate-500">Next 6 hours · ML forecast</p></div><Badge tone="cyan"><BrainCircuit className="h-3 w-3" />94% confidence</Badge></div>
          <div className="mt-6 h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={inflow}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" /><XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} /><Tooltip cursor={{ fill: '#edf7fa' }} contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }} /><Bar dataKey="patients" radius={[5, 5, 0, 0]}>{inflow.map((item) => <Cell key={item.hour} fill={item.hour === '11 AM' ? '#13558f' : '#91d6e5'} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
        <div className="space-y-5">
          <Card className="overflow-hidden border-teal-200 bg-gradient-to-br from-teal-700 to-cyan-700 p-6 text-white"><Sparkles className="h-6 w-6 text-teal-200" /><h2 className="mt-5 text-xl font-bold">Prepare for the 11 AM peak</h2><p className="mt-2 text-sm leading-6 text-teal-50/80">Forecast volume rises 32% between 10–12. Keep a second technician ready.</p><Link href="/prediction" className="mt-6 inline-flex items-center gap-2 text-sm font-bold">View prediction detail <ArrowRight className="h-4 w-4" /></Link></Card>
          <Card className="p-6"><h2 className="font-bold">Quick actions</h2><div className="mt-4 space-y-3"><Link href="/queue" className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Go to queue management <ArrowRight className="h-4 w-4" /></Link><Link href="/patients" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Find a patient <ArrowRight className="h-4 w-4" /></Link></div></Card>
        </div>
      </div>
    </>
  );
}

export function PredictionScreen() {
  const importance = [['Time of day', 88], ['Historical queue load', 72], ['Day of week', 64], ['Local events / holidays', 38]];
  return (
    <>
      <PageHeader eyebrow="Operational forecasting" title="Queue Prediction" description="Live and historical demand signals for proactive staffing and pacing." actions={<div className="flex items-center gap-2"><Badge><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />ECHO-ML v2.4 · Live</Badge><Badge tone="slate">Synthetic demo data</Badge></div>} />
      <Card className="mb-5 border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 p-5"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-teal-700 shadow-sm"><Lightbulb /></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700">AI Insight</p><p className="mt-1 text-base font-bold text-slate-900">Patient inflow is trending 18% above the typical Monday pattern.</p><p className="mt-1 text-sm text-slate-600">Consider assigning an extra technician between 10:30 AM and 12:30 PM.</p></div></div></Card>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Expected today" value="72" note="8 more than typical" icon={Users} /><MetricCard label="Model confidence" value="94%" note="+2.1% in 7 days" icon={Gauge} tone="cyan" /><MetricCard label="Next hour forecast" value="18" note="Peak demand window" icon={TrendingUp} tone="amber" /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_.8fr]">
        <Card className="p-6"><div><h2 className="font-bold">Hourly forecast · next 12 hours</h2><p className="mt-1 text-xs text-slate-500">Actual patient arrivals compared with predicted volume</p></div><div className="mt-6 h-[330px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={forecast}><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" /><XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={11} /><YAxis axisLine={false} tickLine={false} fontSize={11} /><Tooltip contentStyle={{ borderRadius: 8 }} /><Legend /><Line type="monotone" dataKey="actual" stroke="#13558f" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} /><Line type="monotone" dataKey="forecast" stroke="#1d929c" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div></Card>
        <div className="space-y-5"><Card className="p-6"><h2 className="font-bold">What’s driving this forecast</h2><p className="mt-1 text-xs text-slate-500">Relative feature importance</p><div className="mt-5 space-y-4">{importance.map(([label, value]) => <div key={label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{label}</span><span className="text-slate-500">{value}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-400" style={{ width: `${value}%` }} /></div></div>)}</div></Card><Card className="p-6"><h2 className="font-bold">Model information</h2><dl className="mt-4 space-y-3 text-sm">{[['Version', 'ECHO-ML 2.4'], ['Last trained', 'Today, 2:00 AM'], ['7-day accuracy', '93.7%'], ['Next retrain', 'Tomorrow, 2:00 AM']].map(([key, value]) => <div className="flex justify-between" key={key}><dt className="text-slate-500">{key}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></Card></div>
      </div>
    </>
  );
}

export function ReportsScreen() {
  const exportCsv = () => {
    const csv = `Day,Patients served\n${weekly.map((item) => `${item.day},${item.patients}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'echoflow-weekly-report.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeader eyebrow="Operational analytics" title="Reports" description="Track unit performance and export ready-to-share operational summaries." actions={<select aria-label="Report period" className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><option>This week</option><option disabled>Last week (unavailable)</option><option disabled>This month (unavailable)</option></select>} />
      <Card className="mb-5 border-teal-200 bg-teal-50 p-5"><div className="flex gap-4"><Sparkles className="h-6 w-6 shrink-0 text-teal-700" /><div><p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700">AI Summary</p><p className="mt-1 font-bold">Patient volume is up 12% from last week, led by Wednesday’s referral demand.</p><p className="mt-1 text-sm text-slate-600">Despite higher volume, average wait improved by 4 minutes.</p></div></div></Card>
      <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Total patients" value="243" note="+12% week on week" icon={Users} /><MetricCard label="Average wait time" value="23 min" note="4 min improvement" icon={TrendingDown} tone="cyan" /><MetricCard label="Prediction accuracy" value="93.7%" note="Live operational model" icon={Activity} tone="amber" /></div>
      <Card className="mt-5 p-6"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">Patients served per day</h2><p className="mt-1 text-xs text-slate-500">Monday to Friday · average 48.6 patients</p></div><div className="flex gap-2"><Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button><Button onClick={() => window.print()}><Download className="h-4 w-4" />Export report PDF</Button></div></div><div className="mt-6 h-[340px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly}><CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" /><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8 }} /><ReferenceLine y={48.6} stroke="#64748b" strokeDasharray="5 5" label={{ value: 'Average', fill: '#64748b', fontSize: 11 }} /><Bar dataKey="patients" radius={[5, 5, 0, 0]}>{weekly.map((item) => <Cell key={item.day} fill={item.day === 'Wed' ? '#13558f' : '#91d6e5'} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
    </>
  );
}
