'use client';

import { MoreHorizontal, Plus, Search, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminShell from '@/admin/components/AdminShell';
import { AccessRoleModal, AddStaffModal } from '@/admin/components/AdminModals';
import { Avatar, Card, PageHeader, Status } from '@/admin/components/ui';
import { initialStaff, type Staff } from '@/admin/lib/demo-data';

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const filtered = useMemo(() => staff.filter((s) => (filter === 'All' || s.status === filter) && `${s.name} ${s.room} ${s.id}`.toLowerCase().includes(search.toLowerCase())), [staff, filter, search]);
  return <AdminShell>
    <PageHeader eyebrow="People & access" title="Staff Accounts" description="Manage ECHO Unit staff, room assignments and access levels." actions={<button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add staff member</button>} />
    <div className="toolbar"><div className="searchbox"><Search size={16} /><input placeholder="Search by name, staff ID or room…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="chips">{['All', 'Active', 'Pending', 'Suspended'].map((x) => <button key={x} className={`chip ${filter === x ? 'active' : ''}`} onClick={() => setFilter(x)}>{x}{x === 'Pending' ? ` (${staff.filter((s) => s.status === 'Pending').length})` : ''}</button>)}</div></div>
    <Card><div className="card-head"><div><h2>All staff accounts</h2><p>{filtered.length} of {staff.length} staff shown</p></div>{staff.some((s) => s.status === 'Pending') && <button className="btn secondary" onClick={() => setFilter('Pending')}><UserRoundCheck size={15} /> Review pending</button>}</div>
      <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Select all" /></th><th>Staff member</th><th>Role</th><th>Assigned room</th><th>Status</th><th>Last active</th><th>Actions</th></tr></thead><tbody>{filtered.map((s) => <tr key={s.id}><td><input type="checkbox" aria-label={`Select ${s.name}`} /></td><td><div className="staff-cell"><Avatar name={s.name} /><span><strong>{s.name}</strong><small>{s.id} · {s.email}</small></span></div></td><td>{s.role}</td><td>{s.room}</td><td><Status tone={s.status === 'Active' ? 'green' : s.status === 'Pending' ? 'amber' : 'red'}>{s.status}</Status></td><td>{s.lastActive}</td><td><div className="row-actions"><button className="text-link" onClick={() => setEditing(s)}>{s.status === 'Pending' ? 'Review' : 'Edit'}</button><button className="icon-btn"><MoreHorizontal size={15} /></button></div></td></tr>)}</tbody></table></div>
    </Card>
    {adding && <AddStaffModal onClose={() => setAdding(false)} onAdd={(member) => setStaff([...staff, member])} />}
    {editing && <AccessRoleModal staff={editing} onClose={() => setEditing(null)} onSave={(updated) => setStaff((items) => items.map((item) => item.id === updated.id ? updated : item))} />}
  </AdminShell>;
}
