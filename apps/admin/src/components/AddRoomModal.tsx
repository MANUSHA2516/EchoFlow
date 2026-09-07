'use client';

import { Building2, Check, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { Room } from '@/lib/demo-data';
import { Modal, Status, Toggle } from './ui';

export default function AddRoomModal({ onClose, onAdd }: { onClose: () => void; onAdd: (room: Room) => void }) {
  const [name, setName] = useState('Echo Room 3');
  const [type, setType] = useState('Standard Echo');
  const [location, setLocation] = useState('Level 2, Wing B');
  const [live, setLive] = useState(true);
  const room: Room = { name, type, location, status: live ? 'Live' : 'Offline', queue: 0, wait: 0, technicians: 1, capacity: 0, lead: 'N. Bandara' };
  return <Modal title="Add Echo Room" subtitle="Register a room or station and configure operating details." onClose={onClose} wide>
    <div className="room-modal-layout">
      <div className="form-grid two">
        <label className="field"><span>Room name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>Room type</span><select value={type} onChange={(e) => setType(e.target.value)}><option>Standard Echo</option><option>Stress Echo</option><option>TEE</option><option>Pediatric</option><option>Portable</option></select></label>
        <label className="field span-two"><span>Location / wing</span><div className="input-icon"><MapPin size={16} /><input value={location} onChange={(e) => setLocation(e.target.value)} /></div></label>
        <label className="field"><span>Opens</span><input type="time" defaultValue="08:00" /></label>
        <label className="field"><span>Closes</span><input type="time" defaultValue="16:00" /></label>
        <label className="field span-two"><span>Lead technician</span><select><option>N. Bandara</option><option>Amara Silva</option><option>M. Fernando</option></select></label>
        <div className="span-two"><Toggle checked={live} onChange={() => setLive(!live)} label="Make room live immediately" detail="The room will appear in live capacity calculations." /></div>
      </div>
      <div className="preview-side"><p className="eyebrow">Live preview</p><div className="room-preview">
        <div className="room-icon"><Building2 size={22} /></div><Status tone={live ? 'green' : 'gray'}>{live ? 'Live' : 'Offline'}</Status>
        <h3>{name || 'Untitled room'}</h3><p>{type}</p><small><MapPin size={13} /> {location || 'No location'}</small>
        <div className="preview-metrics"><span><b>0</b>In queue</span><span><b>—</b>Avg wait</span><span><b>1</b>Technician</span></div>
        <div className="loadbar"><i style={{ width: '3%' }} /></div>
      </div><p><Check size={14} /> Preview updates as you type</p></div>
    </div>
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { if (name) { onAdd(room); onClose(); } }}><Building2 size={16} /> Add Echo Room</button></div>
  </Modal>;
}
