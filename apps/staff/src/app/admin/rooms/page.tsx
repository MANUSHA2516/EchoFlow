'use client';

import { Building2, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import AddRoomModal from '@/admin/components/AddRoomModal';
import AdminShell from '@/admin/components/AdminShell';
import { Card, Modal, PageHeader, Status } from '@/admin/components/ui';
import { rooms as seededRooms, type Room } from '@/admin/lib/demo-data';

export default function RoomsPage() {
  const [rooms, setRooms] = useState(seededRooms);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  return <AdminShell>
    <PageHeader eyebrow="Room & station management" title="Echo Rooms" description={`${rooms.filter((r) => r.status === 'Live').length} live rooms · ${rooms.reduce((n, r) => n + r.queue, 0)} patients currently queued`} actions={<button className="btn primary" onClick={() => setOpen(true)}><Plus size={16} /> New room</button>} />
    <div className="rooms-grid">{rooms.map((r) => <Card className={`room-card ${r.status === 'Delayed' ? 'delayed' : r.status !== 'Live' ? 'offline' : ''}`} key={r.name}>
      <div className="room-top"><span className="room-icon"><Building2 size={19} /></span><Status tone={r.status === 'Live' ? 'green' : r.status === 'Delayed' ? 'amber' : 'gray'}>{r.status}</Status></div>
      <h2>{r.name}</h2><p>{r.type}</p><p className="location"><MapPin size={12} />{r.location}</p>
      <div className="room-metrics"><span><b>{r.queue}</b>In queue</span><span><b>{r.wait || '—'}</b>Avg wait {r.wait ? 'min' : ''}</span><span><b>{r.technicians}</b>Technicians</span></div>
      <div className="load-label"><span>Current room load</span><b>{r.capacity}%</b></div><div className="loadbar"><i style={{ width: `${r.capacity}%`, background: r.capacity > 80 ? '#e39c22' : undefined }} /></div>
      <div className="room-bottom"><button className="text-link" onClick={() => setSelected(r)}>Open room queue →</button><small>Lead: {r.lead}</small></div>
    </Card>)}</div>
    {open && <AddRoomModal onClose={() => setOpen(false)} onAdd={(room) => setRooms([...rooms, room])} />}
    {selected && <Modal title={`${selected.name} queue`} subtitle="Live operational room summary" onClose={() => setSelected(null)}>
      <div className="metric-list">
        {[['Room status', selected.status], ['Patients waiting', String(selected.queue)], ['Average wait', `${selected.wait || '—'} min`], ['Lead technician', selected.lead], ['Current load', `${selected.capacity}%`]].map(([label, value]) => <div className="metric-row" key={label}><span>{label}</span><b>{value}</b></div>)}
      </div>
      <div className="notice"><Building2 size={18} /><span><b>Queue control belongs to assigned staff</b><small>Administrators can monitor room load here; call, skip, and completion actions remain in the Staff portal.</small></span></div>
      <div className="modal-actions"><button className="btn primary" onClick={() => setSelected(null)}>Done</button></div>
    </Modal>}
  </AdminShell>;
}
