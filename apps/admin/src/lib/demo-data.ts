export type Room = {
  name: string; type: string; location: string; status: 'Live' | 'Delayed' | 'Offline' | 'Off unit';
  queue: number; wait: number; technicians: number; capacity: number; lead: string;
};

export const rooms: Room[] = [
  { name: 'Echo Room 1', type: 'Standard Echo', location: 'Level 2, Wing B', status: 'Live', queue: 8, wait: 18, technicians: 2, capacity: 74, lead: 'N. Bandara' },
  { name: 'Echo Room 2', type: 'Standard Echo', location: 'Level 2, Wing B', status: 'Live', queue: 6, wait: 14, technicians: 2, capacity: 58, lead: 'Amara Silva' },
  { name: 'Stress Echo Suite', type: 'Stress Echo', location: 'Level 2, Wing C', status: 'Delayed', queue: 5, wait: 30, technicians: 1, capacity: 88, lead: 'M. Fernando' },
  { name: 'TEE Suite', type: 'TEE', location: 'Level 3, Wing A', status: 'Live', queue: 3, wait: 12, technicians: 1, capacity: 42, lead: 'R. Perera' },
  { name: 'Pediatric Echo', type: 'Pediatric', location: 'Level 1, Wing A', status: 'Live', queue: 4, wait: 16, technicians: 1, capacity: 53, lead: 'S. Kumari' },
  { name: 'Portable / Bedside Unit', type: 'Portable', location: 'Mobile', status: 'Off unit', queue: 2, wait: 22, technicians: 0, capacity: 28, lead: 'Unassigned' },
];

export type Staff = { id: string; name: string; email: string; phone: string; role: 'Technician' | 'Room Lead'; room: string; status: 'Active' | 'Pending' | 'Suspended'; lastActive: string };
export const initialStaff: Staff[] = [
  { id: 'ECHO-STF-001', name: 'N. Bandara', email: 'n.bandara@echoflow.demo', phone: '+94 77 123 4501', role: 'Technician', room: 'Echo Room 1', status: 'Active', lastActive: '2 min ago' },
  { id: 'ECHO-STF-002', name: 'Amara Silva', email: 'a.silva@echoflow.demo', phone: '+94 77 123 4502', role: 'Room Lead', room: 'Echo Room 2', status: 'Active', lastActive: '12 min ago' },
  { id: 'ECHO-STF-003', name: 'M. Fernando', email: 'm.fernando@echoflow.demo', phone: '+94 77 123 4503', role: 'Technician', room: 'Stress Echo Suite', status: 'Pending', lastActive: 'Never' },
  { id: 'ECHO-STF-008', name: 'R. Perera', email: 'r.perera@echoflow.demo', phone: '+94 77 221 4180', role: 'Technician', room: 'TEE Suite', status: 'Active', lastActive: '34 min ago' },
  { id: 'ECHO-STF-011', name: 'S. Kumari', email: 's.kumari@echoflow.demo', phone: '+94 77 784 1930', role: 'Room Lead', room: 'Pediatric Echo', status: 'Suspended', lastActive: '6 days ago' },
];

export const alerts = [
  { tone: 'critical', title: 'Stress Echo Suite wait above SLA', detail: '30 min average vs 20 min target', time: '8 min ago' },
  { tone: 'warning', title: '2 technician accounts pending approval', detail: 'Submitted by room lead', time: '24 min ago' },
  { tone: 'info', title: 'AI model retrain scheduled', detail: 'ECHO-ML v3.4.1 · Sunday 02:00', time: '1 hr ago' },
];

export const auditEvents = [
  { category: 'Staff actions', actor: 'D. Jayasuriya', action: 'approved a staff account', target: 'M. Fernando · ECHO-STF-003', time: '10:42 AM', tone: 'success' },
  { category: 'Staff actions', actor: 'Amara Silva', action: 'updated room operating hours', target: 'Echo Room 2 · 08:00–16:30', time: '9:18 AM', tone: 'success' },
  { category: 'Security', actor: 'Unknown user', action: 'failed admin sign-in attempt', target: 'IP 192.168.1.24 · attempt blocked', time: '8:55 AM', tone: 'danger' },
  { category: 'AI & system', actor: 'ECHO-ML service', action: 'published queue forecast', target: 'Predicted peak 1:30–3:00 PM', time: '8:30 AM', tone: 'info' },
  { category: 'Staff actions', actor: 'N. Bandara', action: 'marked a patient scan done', target: 'Ticket A-009 · Echo Room 1', time: '8:12 AM', tone: 'success' },
  { category: 'AI & system', actor: 'System', action: 'completed nightly data backup', target: 'All collections verified', time: '7:00 AM', tone: 'info' },
];

export const forecast = [
  { hour: '8 AM', actual: 7, predicted: 8 }, { hour: '9 AM', actual: 11, predicted: 10 },
  { hour: '10 AM', actual: 14, predicted: 13 }, { hour: '11 AM', actual: 12, predicted: 14 },
  { hour: '12 PM', actual: 9, predicted: 11 }, { hour: '1 PM', actual: 0, predicted: 15 },
  { hour: '2 PM', actual: 0, predicted: 17 }, { hour: '3 PM', actual: 0, predicted: 13 },
  { hour: '4 PM', actual: 0, predicted: 8 },
];
