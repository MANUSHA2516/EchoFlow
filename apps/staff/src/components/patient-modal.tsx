'use client';

import { useState } from 'react';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { Button, Field, Modal } from './ui';

export function RegisterPatientModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: (name: string, urgent: boolean) => void }) {
  const [name, setName] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [saved, setSaved] = useState('');

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSaved?.(name.trim(), urgent);
    setSaved(`${name.trim()} was registered and added as ticket A-015.`);
    setTimeout(() => {
      setSaved('');
      setName('');
      setUrgent(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal open={open} onClose={onClose} title="Register new patient">
      <form onSubmit={save} className="p-6">
        <p className="mb-6 text-sm leading-6 text-slate-500">Create a digital patient record and issue a ticket in today&apos;s live queue.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient's full name" required /></div>
          <Field label="NIC number" placeholder="200012345678" required />
          <Field label="Phone" placeholder="+94 77 123 4567" required />
          <Field label="Date of birth" type="date" required />
          <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Reason for visit</span><select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-teal-500"><option>Routine ECHO scan</option><option>Follow-up</option><option>Doctor referral</option><option>Urgent assessment</option></select></label>
        </div>
        <fieldset className="mt-6"><legend className="mb-3 text-sm font-semibold text-slate-700">Queue priority</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setUrgent(false)} className={`rounded-2xl border p-4 text-left transition ${!urgent ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/10' : 'border-slate-200'}`}><span className="block text-sm font-bold">Normal</span><span className="mt-1 block text-xs text-slate-500">Standard queue order</span></button><button type="button" onClick={() => setUrgent(true)} className={`rounded-2xl border p-4 text-left transition ${urgent ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/10' : 'border-slate-200'}`}><span className="flex items-center gap-1.5 text-sm font-bold text-rose-700"><AlertTriangle className="h-4 w-4" />Urgent</span><span className="mt-1 block text-xs text-slate-500">Prioritise when calling next</span></button></div></fieldset>
        {saved && <p className="mt-5 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">{saved}</p>}
        <div className="mt-7 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit"><UserPlus className="h-4 w-4" />Save and add to queue</Button></div>
      </form>
    </Modal>
  );
}
