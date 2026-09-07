'use client';

import { BrainCircuit, Download, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminShell from '@/components/AdminShell';
import { Card, PageHeader, Status } from '@/components/ui';
import { forecast } from '@/lib/demo-data';

export default function InsightsPage() {
  function exportReport() {
    const csv = ['Hour,Actual,Predicted', ...forecast.map((x) => `${x.hour},${x.actual},${x.predicted}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const a = document.createElement('a'); a.href = url; a.download = 'echoflow-ai-forecast.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return <AdminShell>
    <PageHeader eyebrow="Operational intelligence" title="AI Insights & Reports" description="Queue demand forecasts and unit-level performance aggregates." actions={<button className="btn secondary" onClick={exportReport}><Download size={15} /> Export report</button>} />
    <Card className="insight"><span><Sparkles size={21} /></span><div className="insight-content"><p className="eyebrow">Today’s recommendation · ECHO-ML v3.4.1</p><h2>Afternoon demand is forecast 24% above the weekday baseline</h2><p>Arrivals are likely to peak between 1:30 and 3:00 PM. Shift one available technician to Stress Echo Suite before 1:15 PM to reduce the expected backlog.</p></div><Status tone="green">Model live</Status></Card>
    <div className="kpi-grid">
      {[{ label: 'Forecast patients', value: '96', detail: 'Expected today', icon: Users }, { label: 'Predicted peak', value: '2 PM', detail: '17 arrivals / hour', icon: TrendingUp }, { label: 'Average wait', value: '19 min', detail: 'Target under 20 min', icon: BrainCircuit }, { label: 'Forecast confidence', value: '92%', detail: 'Synthetic demo metric', icon: Sparkles }].map(({ label, value, detail, icon: Icon }) => <Card className="kpi" key={label}><div className="kpi-top"><span className="kpi-icon"><Icon size={18} /></span></div><h3>{value}</h3><p>{label}<br /><span>{detail}</span></p></Card>)}
    </div>
    <div className="report-grid">
      <Card className="chart-card"><h2>Hourly queue volume</h2><p>Actual arrivals compared with the operational forecast</p><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={forecast}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edef" /><XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#7d8997' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: '#7d8997' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8, borderColor: '#dfe5e8', fontSize: 10 }} /><Legend wrapperStyle={{ fontSize: 10 }} /><Bar dataKey="actual" name="Actual" fill="#0b817a" radius={[4, 4, 0, 0]} /><Bar dataKey="predicted" name="Forecast" fill="#9bd7d0" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><div className="card-head"><div><h2>Unit report</h2><p>Today through 12:30 PM</p></div></div><div className="metric-list">{[['Patients completed', '68'], ['Rooms online', '5 of 6'], ['SLA compliance', '88%'], ['No-show rate', '4.2%'], ['Longest wait', '34 min'], ['Peak room', 'Stress Echo']].map(([label, value]) => <div className="metric-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div></Card>
    </div>
  </AdminShell>;
}
