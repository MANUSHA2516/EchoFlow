'use client';

import { Check, Clock3, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { rooms, type Staff } from '@/lib/demo-data';
import { Modal, Toggle } from './ui';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="field"><span>{label}</span>{children}</label>;

export function AddTechnicianModal({ onClose, onAdd }: { onClose: () => void; onAdd?: (staff: Staff) => void }) {
  const [invite, setInvite] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('Echo Room 1');
  const [role, setRole] = useState<'Technician' | 'Room Lead'>('Technician');
  function save() {
    if (!name || !email) return;
    onAdd?.({ id: `ECHO-STF-${Math.floor(100 + Math.random() * 899)}`, name, email, phone: 'Not added', role, room, status: 'Pending', lastActive: 'Never' });
    onClose();
  }
  return <Modal title="Add technician to today’s roster" subtitle="Quickly fill a shift without leaving the unit overview." onClose={onClose}>
    <div className="form-grid two">
      <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kavindi Perera" /></Field>
      <Field label="Email address"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@hospital.lk" /></Field>
      <Field label="Assigned room"><select value={room} onChange={(e) => setRoom(e.target.value)}>{rooms.map((r) => <option key={r.name}>{r.name}</option>)}</select></Field>
      <Field label="Role"><div className="segmented"><button className={role === 'Technician' ? 'selected' : ''} onClick={() => setRole('Technician')}>Technician</button><button className={role === 'Room Lead' ? 'selected' : ''} onClick={() => setRole('Room Lead')}>Room Lead</button></div></Field>
      <Field label="Shift start"><div className="input-icon"><Clock3 size={16} /><input type="time" defaultValue="09:00" /></div></Field>
      <Field label="Shift end"><div className="input-icon"><Clock3 size={16} /><input type="time" defaultValue="16:00" /></div></Field>
    </div>
    <Toggle checked={invite} onChange={() => setInvite(!invite)} label="Send invite email now" detail="The technician will receive setup instructions immediately." />
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" onClick={save}><Mail size={16} /> Add to roster</button></div>
  </Modal>;
}

export function AddStaffModal({ onClose, onAdd }: { onClose: () => void; onAdd: (staff: Staff) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState(rooms[0]?.name ?? 'Echo Room 1');
  const [role, setRole] = useState<'Technician' | 'Room Lead'>('Technician');
  const id = `ECHO-STF-${String(16 + name.length).padStart(3, '0')}`;
  return <Modal title="Add staff member" subtitle="Create a permanent ECHO Unit account and send an invitation." onClose={onClose}>
    <div className="form-grid two">
      <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full legal name" /></Field>
      <Field label="Staff ID"><input value={id} readOnly /></Field>
      <Field label="Email address"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@hospital.lk" /></Field>
      <Field label="Assigned room"><select value={room} onChange={(e) => setRoom(e.target.value)}>{rooms.map((r) => <option key={r.name}>{r.name}</option>)}</select></Field>
      <Field label="Role"><select value={role} onChange={(e) => setRole(e.target.value as 'Technician' | 'Room Lead')}><option>Technician</option><option>Room Lead</option></select></Field>
    </div>
    <div className="notice"><Mail size={18} /><span><b>An invitation will be emailed</b><small>The account remains pending until setup is complete.</small></span></div>
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { if (name && email) { onAdd({ id, name, email, phone: 'Not added', role, room, status: 'Pending', lastActive: 'Never' }); onClose(); } }}><Mail size={16} /> Send invite & create</button></div>
  </Modal>;
}

export function AccessRoleModal({ staff, onClose, onSave }: { staff: Staff; onClose: () => void; onSave: (staff: Staff) => void }) {
  const [step, setStep] = useState(2);
  const [room, setRoom] = useState(staff.room);
  const [role, setRole] = useState(staff.role);
  const permissions = role === 'Room Lead'
    ? ['View and manage own room queue', 'Edit patient operational records', 'Add or remove room staff', 'Manage other echo rooms']
    : ['View and manage own room queue', 'Edit patient operational records', 'Complete and skip queue tickets'];
  return <Modal title="Staff member — Access & role" subtitle={`Review access for ${staff.name}`} onClose={onClose} wide>
    <div className="steps">{['Details', 'Access & role', 'Review'].map((label, i) => <button onClick={() => setStep(i + 1)} className={step >= i + 1 ? 'done' : ''} key={label}><i>{step > i + 1 ? <Check size={13} /> : i + 1}</i><span>{label}</span></button>)}</div>
    {step === 1 && <div className="identity-panel"><div className="avatar avatar-large">{staff.name.slice(0, 2)}</div><div><h3>{staff.name}</h3><p>{staff.id}</p><p>{staff.email} · {staff.phone}</p></div></div>}
    {step === 2 && <div className="access-layout">
      <div><h3>Assigned room</h3><p className="muted">Choose the room this staff member works in.</p><div className="room-selector">{rooms.map((r) => <button className={room === r.name ? 'chosen' : ''} onClick={() => setRoom(r.name)} key={r.name}><b>{r.name}</b><small>{r.queue} in queue</small></button>)}</div></div>
      <div><h3>Role</h3><div className="role-options">{(['Technician', 'Room Lead'] as const).map((r) => <button className={role === r ? 'chosen' : ''} onClick={() => setRole(r)} key={r}><i /> <span><b>{r}</b><small>{r === 'Technician' ? 'Runs and manages their room queue' : 'Can also manage staff for this room'}</small></span></button>)}</div>
        <div className="permission-box"><b>What {role.toLowerCase()} access includes</b>{permissions.map((p) => <span key={p}><Check size={14} />{p}</span>)}</div>
      </div>
    </div>}
    {step === 3 && <div className="review-panel"><Sparkles size={25} /><h3>Ready to update access</h3><p>{staff.name} will be assigned to <b>{room}</b> as <b>{role}</b>.</p></div>}
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button>{step > 1 && <button className="btn secondary" onClick={() => setStep(step - 1)}>Back</button>}<button className="btn primary" onClick={() => step < 3 ? setStep(step + 1) : (onSave({ ...staff, room, role }), onClose())}>{step < 3 ? 'Continue' : 'Save access'}</button></div>
  </Modal>;
}
