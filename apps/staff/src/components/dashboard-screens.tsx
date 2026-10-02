'use client';

import Link from 'next/link';
import { Activity, ArrowRight, BrainCircuit, Clock3, Download, Gauge, Lightbulb, Sparkles, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  const totalPatients = weekly.reduce((total, item) => total + item.patients, 0);
  const averagePerDay = weekly.reduce((total, item) => total + item.patients, 0) / weekly.length;
  const busiestDay = weekly.reduce((busiest, item) => item.patients > busiest.patients ? item : busiest);
  const weeklyChartData = weekly.map((item) => ({ ...item, average: averagePerDay }));
  const exportCsv = () => {
    const csv = `Day,Patients served\n${weekly.map((item) => `${item.day},${item.patients}`).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'echoflow-weekly-report.csv'; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageHeader
        eyebrow="Operational analytics"
        title="Reports"
        description="Track unit performance and export ready-to-share operational summaries."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Report period" className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold">
              <option>This week</option><option disabled>Last week (unavailable)</option><option disabled>This month (unavailable)</option>
            </select>
            <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</Button>
            <Button onClick={() => window.print()}><Download className="h-4 w-4" />Export PDF</Button>
          </div>
        )}
      />
      <Card className="mb-5 overflow-hidden border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-900/15"><Sparkles className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-700">Weekly performance summary</p>
            <h2 className="mt-1 text-base font-bold text-slate-900">Patient volume is up 12% from last week, led by Wednesday’s referral demand.</h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">Average wait improved by 4 minutes, with {busiestDay.day} recording the highest daily volume.</p>
          </div>
          <Badge tone="cyan"><Activity className="h-3 w-3" />This week</Badge>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Patients served', value: String(totalPatients), note: '+12% week on week', icon: Users, tone: 'text-sky-700 bg-sky-50' },
          { label: 'Busiest day', value: busiestDay.day, note: `${busiestDay.patients} patients served`, icon: TrendingUp, tone: 'text-teal-700 bg-teal-50' },
          { label: 'Average wait time', value: '23 min', note: '4 min improvement', icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Prediction accuracy', value: '93.7%', note: 'Operational model', icon: Activity, tone: 'text-cyan-700 bg-cyan-50' },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <Card className="p-4 sm:p-5" key={label}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-[18px] w-[18px]" /></span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{note}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,.8fr)]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">Weekly activity</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
              <div><h2 className="font-bold text-slate-900">Patients served per day</h2><p className="mt-1 text-xs text-slate-500">Completed visits · Monday to Friday</p></div>
              <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">Average {averagePerDay.toFixed(1)} / day</span>
            </div>
          </div>
          <div className="h-[240px] px-3 py-4 sm:h-[270px] sm:px-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 18, right: 8, bottom: 0, left: -14 }} barCategoryGap="14%" barGap={5}>
                <defs>
                  <linearGradient id="reportDailyBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a5e4e9" /><stop offset="100%" stopColor="#65bdca" /></linearGradient>
                  <linearGradient id="reportPeakBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#21b7b0" /><stop offset="100%" stopColor="#087f8c" /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 6" stroke="#e8eef3" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={34} />
                <Tooltip cursor={{ fill: '#f1f7f8' }} contentStyle={{ borderRadius: 10, borderColor: '#e2e8f0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }} formatter={(value, name) => [`${Number(value).toFixed(name === 'Weekly average' ? 1 : 0)} patients`, name]} labelFormatter={(label) => `${label} · daily total`} />
                <Legend align="right" verticalAlign="top" height={26} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                <Bar dataKey="patients" name="Patients served" radius={[7, 7, 2, 2]} maxBarSize={82}>
                  {weekly.map((item) => <Cell key={item.day} fill={item.day === busiestDay.day ? 'url(#reportPeakBar)' : 'url(#reportDailyBar)'} />)}
                  <LabelList dataKey="patients" position="top" offset={8} fill="#475569" fontSize={11} fontWeight={700} />
                </Bar>
                <Bar dataKey="average" name="Weekly average" fill="#d6e3e9" radius={[7, 7, 2, 2]} maxBarSize={82} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700">This week</p><h2 className="mt-1 font-bold text-slate-900">Unit report</h2><p className="mt-1 text-xs text-slate-500">Weekly performance at a glance</p></div>
          <div className="divide-y divide-slate-100 px-5">
            {[
              ['Patients served', String(totalPatients)],
              ['Reporting days', String(weekly.length)],
              ['Daily average', averagePerDay.toFixed(1)],
              ['Busiest day', `${busiestDay.day} · ${busiestDay.patients}`],
              ['Average wait', '23 min'],
            ].map(([label, value]) => <div className="flex items-center justify-between gap-3 py-3.5 text-sm" key={label}><span className="text-slate-500">{label}</span><b className="text-right font-semibold text-slate-800">{value}</b></div>)}
          </div>
          <div className="mx-5 mb-5 rounded-lg bg-teal-50 px-3.5 py-3"><p className="text-xs font-semibold text-teal-900">{busiestDay.day} was the busiest day</p><p className="mt-0.5 text-xs text-teal-800/80">{busiestDay.patients} patients were served.</p></div>
        </Card>
      </div>
    </>
  );
}
