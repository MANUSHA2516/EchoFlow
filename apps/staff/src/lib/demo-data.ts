export type Patient = {
  id: string;
  name: string;
  nic: string;
  phone: string;
  age: number;
  type: string;
  lastVisit: string;
  priority?: boolean;
};

export type QueuePatient = {
  ticket: string;
  name: string;
  type: string;
  wait: number;
  urgent?: boolean;
};

export const staff = {
  name: 'N. Bandara',
  fullName: 'Nimal Bandara',
  id: 'ECHO-STF-001',
  role: 'ECHO Unit Technician',
  department: 'Echocardiography Unit',
  hospital: 'General Hospital, Sri Lanka',
  email: 'n.bandara@echoflow.demo',
  phone: '+94 77 123 4501',
  dob: '1991-08-12',
};

export const initialQueue: QueuePatient[] = [
  { ticket: 'A-010', name: 'N. Bandara', type: 'Routine ECHO scan', wait: 15 },
  { ticket: 'A-012', name: 'R. Wickramasinghe', type: 'Routine ECHO scan', wait: 18, urgent: true },
  { ticket: 'A-011', name: 'R. Jayawardena', type: 'Follow-up', wait: 25 },
  { ticket: 'A-014', name: 'Kasun Perera', type: 'Routine ECHO scan', wait: 32 },
];

export const patients: Patient[] = [
  { id: 'kasun-perera', name: 'Kasun Perera', nic: '200012345678', phone: '+94 71 234 5678', age: 38, type: 'ECHO scan', lastVisit: '20 Aug 2026' },
  { id: 's-silva', name: 'S. Silva', nic: '199012340001', phone: '+94 71 000 0001', age: 36, type: 'ECHO scan', lastVisit: 'Today' },
  { id: 'r-wickramasinghe', name: 'R. Wickramasinghe', nic: '198512340002', phone: '+94 71 000 0002', age: 41, type: 'Referral', lastVisit: 'Today', priority: true },
  { id: 'n-bandara', name: 'N. Bandara', nic: '199212340004', phone: '+94 71 000 0004', age: 34, type: 'Follow-up', lastVisit: '12 Aug 2026' },
  { id: 'r-jayawardena', name: 'R. Jayawardena', nic: '199512340003', phone: '+94 71 000 0003', age: 31, type: 'Follow-up', lastVisit: '03 Jul 2026' },
  { id: 'd-perera', name: 'D. Perera', nic: '197812349876', phone: '+94 77 123 9876', age: 48, type: 'ECHO scan', lastVisit: '28 Jun 2026' },
];

export const inflow = [
  { hour: '9 AM', patients: 8 }, { hour: '10 AM', patients: 12 },
  { hour: '11 AM', patients: 18 }, { hour: '12 PM', patients: 15 },
  { hour: '1 PM', patients: 10 }, { hour: '2 PM', patients: 7 },
];

export const forecast = [
  { hour: '8 AM', actual: 5, forecast: 6 }, { hour: '9 AM', actual: 9, forecast: 8 },
  { hour: '10 AM', actual: 12, forecast: 13 }, { hour: '11 AM', actual: 17, forecast: 18 },
  { hour: '12 PM', actual: 13, forecast: 15 }, { hour: '1 PM', forecast: 12 },
  { hour: '2 PM', forecast: 9 }, { hour: '3 PM', forecast: 7 },
  { hour: '4 PM', forecast: 5 }, { hour: '5 PM', forecast: 3 },
];

export const weekly = [
  { day: 'Mon', patients: 42 }, { day: 'Tue', patients: 48 },
  { day: 'Wed', patients: 57 }, { day: 'Thu', patients: 45 },
  { day: 'Fri', patients: 51 },
];

export const visits = [
  { date: '20 Aug 2026', type: 'Doctor referral', doctor: 'Dr. Fernando', summary: 'Referral scan completed and archived.', status: 'Archived' },
  { date: '03 Jul 2026', type: 'Follow-up', doctor: 'Dr. Silva', summary: 'Follow-up consultation completed. Review in six months.', status: 'Review due' },
  { date: '12 Jun 2026', type: 'Routine ECHO scan', doctor: 'Dr. Perera', summary: 'Routine ECHO scan completed.', status: 'Normal' },
];
