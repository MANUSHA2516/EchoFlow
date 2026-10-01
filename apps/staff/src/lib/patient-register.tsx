'use client';

import { createContext, useContext, useState } from 'react';
import { patients, type Patient } from './demo-data';

export type Registration = { name: string; nic: string; phone: string; dob: string; type: string; urgent: boolean };
type Register = { records: Patient[]; add: (data: Registration) => void; notes: Record<string, string>; saveNote: (id: string, note: string) => void };
const Context = createContext<Register | null>(null);

// Demo records stay in memory and survive navigation; no patient data is written to browser storage.
export function PatientRegisterProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState(patients);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const add = (data: Registration) => {
    const birth = new Date(`${data.dob}T00:00:00`);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    const patient: Patient = { id: crypto.randomUUID(), name: data.name, nic: data.nic, phone: data.phone, age, type: data.type, priority: data.urgent, lastVisit: 'Today' };
    setRecords((items) => [patient, ...items]);
  };
  return <Context.Provider value={{ records, add, notes, saveNote: (id, note) => setNotes((items) => ({ ...items, [id]: note })) }}>{children}</Context.Provider>;
}

export function usePatientRegister() {
  const value = useContext(Context);
  if (!value) throw new Error('Patient register provider is required');
  return value;
}
