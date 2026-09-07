import {
  NotificationType,
  TicketStage,
  TIME_SLOT_LABELS,
  TimeSlot,
  VisitReason,
  VisitStatus,
} from '@echoflow/types';
import type {
  AuthPurpose,
  DashboardData,
  NotificationItem,
  OtpChallenge,
  PatientProfile,
  QueueSnapshot,
  VisitItem,
} from '../types/patient';
import { toE164FromLocal } from './format';

const DEMO_OTP = '123456';

function nowIso(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function createInitialPatient(): PatientProfile {
  return {
    id: 'demo-patient-kasun',
    fullName: 'Kasun Perera',
    nic: '200012345678',
    phoneE164: '+94712345678',
    dateOfBirth: '1988-05-14',
    address: 'Nugegoda',
    verified: true,
    memberSinceYear: 2026,
    totalVisits: 3,
    lastTicketNumber: 'A-014',
  };
}

function createInitialQueue(): QueueSnapshot {
  return {
    ticketNumber: 'A-014',
    stage: TicketStage.Waiting,
    predictedWaitMinutes: 32,
    currentlyServing: 'A-009',
    patientsAhead: 5,
    totalInQueue: 14,
    positionMovedAlert:
      'Your position moved back — another patient checked in on-site (QR verified) and was given priority.',
    onSite: false,
    reason: VisitReason.RoutineEcho,
    slot: '09-11',
    notes: 'Any symptoms or referral details',
    timeline: [
      {
        ticketNumber: 'A039',
        stage: 'completed',
        label: 'Completed',
        etaMinutes: 0,
      },
      {
        ticketNumber: 'A040',
        stage: 'in_progress',
        label: 'ahead of you',
        etaMinutes: 4,
      },
      {
        ticketNumber: 'A041',
        stage: 'next_up',
        label: 'NEXT UP',
        etaMinutes: 7,
      },
      {
        ticketNumber: 'A042',
        stage: 'you',
        label: 'YOU ARE HERE',
        etaMinutes: 11,
        isYou: true,
      },
    ],
  };
}

function createInitialVisits(): VisitItem[] {
  return [
    {
      id: 'v1',
      visitType: VisitReason.RoutineEcho,
      serviceDate: '2026-06-12',
      doctorName: 'Dr. Perera',
      status: VisitStatus.Completed,
    },
    {
      id: 'v2',
      visitType: VisitReason.FollowUp,
      serviceDate: '2026-07-03',
      doctorName: 'Dr. Silva',
      status: VisitStatus.Completed,
    },
    {
      id: 'v3',
      visitType: VisitReason.DoctorReferral,
      serviceDate: '2026-08-20',
      doctorName: 'Dr. Fernando',
      status: VisitStatus.Archived,
    },
  ];
}

function createInitialNotifications(): NotificationItem[] {
  return [
    {
      id: 'n1',
      type: NotificationType.PositionMoved,
      title: 'Your position moved back',
      body: 'Another patient checked in on-site (QR verified) and was given priority.',
      createdAt: nowIso(-2 * 60_000),
      readAt: null,
    },
    {
      id: 'n2',
      type: NotificationType.Proximity,
      title: "You're 3 patients away",
      body: 'Head to the Echo Room waiting area now.',
      createdAt: nowIso(-6 * 60_000),
      readAt: null,
    },
    {
      id: 'n3',
      type: NotificationType.CheckedIn,
      title: 'Checked in successfully',
      body: 'GPS verified — you are marked on-site.',
      createdAt: nowIso(-34 * 60_000),
      readAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    },
    {
      id: 'n4',
      type: NotificationType.QueueConfirmed,
      title: 'Queue slot confirmed',
      body: "You've joined today's queue — ticket A-014.",
      createdAt: nowIso(-60 * 60_000),
      readAt: new Date(Date.now() - 50 * 60_000).toISOString(),
    },
    {
      id: 'n5',
      type: NotificationType.AppointmentReminder,
      title: 'Appointment reminder',
      body: 'Your ECHO unit visit is coming up. Join the digital queue when ready.',
      createdAt: nowIso(-26 * 60 * 60_000),
      readAt: new Date(Date.now() - 20 * 60 * 60_000).toISOString(),
    },
  ];
}

type DemoState = {
  session: boolean;
  patient: PatientProfile;
  queue: QueueSnapshot;
  visits: VisitItem[];
  notifications: NotificationItem[];
  challenges: Map<string, OtpChallenge & { code: string }>;
  checkInToken: string;
  checkInExpiresAt: number;
};

let state: DemoState = resetState();

function resetState(): DemoState {
  return {
    session: false,
    patient: createInitialPatient(),
    queue: createInitialQueue(),
    visits: createInitialVisits(),
    notifications: createInitialNotifications(),
    challenges: new Map(),
    checkInToken: `EF-CHK-${Date.now().toString(36).toUpperCase()}`,
    checkInExpiresAt: Date.now() + 5 * 60_000,
  };
}

function delay(ms = 350) {
  return new Promise((r) => setTimeout(r, ms));
}

function assertSession() {
  if (!state.session) throw new Error('Not authenticated');
}

function unreadCount() {
  return state.notifications.filter((n) => !n.readAt).length;
}

function dashboard(): DashboardData {
  return {
    patient: { ...state.patient },
    queue: {
      ...state.queue,
      timeline: state.queue.timeline.map((t) => ({ ...t })),
    },
    unreadNotifications: unreadCount(),
    slotWaitEstimates: {
      '09-11': 40,
      '11-13': 28,
      '14-16': 22,
    },
  };
}

export const demoApi = {
  reset() {
    state = resetState();
  },

  async login(nic: string, phoneLocal: string) {
    await delay();
    const phoneE164 = toE164FromLocal(phoneLocal);
    if (nic !== state.patient.nic || phoneE164 !== state.patient.phoneE164) {
      // Allow any NIC/phone in demo by adopting credentials for convenience
      if (nic.length < 9) throw new Error('Enter a valid NIC number');
      if (phoneLocal.replace(/\D/g, '').length < 9) {
        throw new Error('Enter a valid Sri Lankan mobile number');
      }
      state.patient = {
        ...state.patient,
        nic,
        phoneE164,
      };
    }
    const challengeId = `chal-${Date.now()}`;
    const challenge: OtpChallenge & { code: string } = {
      challengeId,
      phoneE164: state.patient.phoneE164,
      purpose: 'login',
      expiresInSeconds: 300,
      code: DEMO_OTP,
    };
    state.challenges.set(challengeId, challenge);
    return { challengeId, phoneE164: challenge.phoneE164, expiresInSeconds: 300 };
  },

  async register(input: {
    fullName: string;
    nic: string;
    phoneLocal: string;
    dateOfBirth: string;
  }) {
    await delay();
    if (!input.fullName.trim()) throw new Error('Full name is required');
    if (input.nic.length < 9) throw new Error('Enter a valid NIC number');
    const phoneE164 = toE164FromLocal(input.phoneLocal);
    const challengeId = `chal-${Date.now()}`;
    const challenge: OtpChallenge & { code: string } = {
      challengeId,
      phoneE164,
      purpose: 'register',
      expiresInSeconds: 300,
      code: DEMO_OTP,
      pendingRegistration: {
        fullName: input.fullName.trim(),
        nic: input.nic.trim(),
        phoneE164,
        dateOfBirth: input.dateOfBirth,
      },
    };
    state.challenges.set(challengeId, challenge);
    return { challengeId, phoneE164, expiresInSeconds: 300 };
  },

  async verifyOtp(challengeId: string, code: string) {
    await delay();
    const challenge = state.challenges.get(challengeId);
    if (!challenge) throw new Error('OTP challenge expired. Request a new code.');
    if (code !== challenge.code && code !== DEMO_OTP) {
      throw new Error('Invalid verification code');
    }

    if (challenge.purpose === 'register' && challenge.pendingRegistration) {
      const reg = challenge.pendingRegistration;
      state.patient = {
        ...state.patient,
        fullName: reg.fullName,
        nic: reg.nic,
        phoneE164: reg.phoneE164,
        dateOfBirth: reg.dateOfBirth,
        verified: true,
        totalVisits: 0,
        lastTicketNumber: undefined,
        address: '',
      };
      state.queue = {
        ticketNumber: null,
        stage: null,
        predictedWaitMinutes: null,
        currentlyServing: 'A-009',
        patientsAhead: 0,
        totalInQueue: 14,
        positionMovedAlert: null,
        onSite: false,
        timeline: [],
      };
      state.session = false;
      state.challenges.delete(challengeId);
      return {
        purpose: 'register' as AuthPurpose,
        tokens: null as null,
        patient: { ...state.patient },
      };
    }

    if (challenge.purpose === 'phone_change' && challenge.pendingPhoneE164) {
      state.patient.phoneE164 = challenge.pendingPhoneE164;
      state.patient.verified = true;
      state.challenges.delete(challengeId);
      return {
        purpose: 'phone_change' as AuthPurpose,
        tokens: null as null,
        patient: { ...state.patient },
      };
    }

    state.session = true;
    state.challenges.delete(challengeId);
    return {
      purpose: 'login' as AuthPurpose,
      tokens: {
        accessToken: 'demo-access',
        refreshToken: 'demo-refresh',
        expiresIn: '7d',
      },
      patient: { ...state.patient },
    };
  },

  async resendOtp(challengeId: string) {
    await delay(200);
    const challenge = state.challenges.get(challengeId);
    if (!challenge) throw new Error('OTP challenge not found');
    challenge.code = DEMO_OTP;
    challenge.expiresInSeconds = 300;
    return { expiresInSeconds: 300 };
  },

  async restoreSession(hasToken: boolean) {
    await delay(150);
    state.session = hasToken;
    return hasToken ? dashboard() : null;
  },

  async logout() {
    await delay(100);
    state.session = false;
  },

  async getDashboard() {
    await delay();
    assertSession();
    return dashboard();
  },

  async joinQueue(input: {
    reason: VisitReason;
    slot: TimeSlot;
    notes?: string;
  }) {
    await delay();
    assertSession();
    if (state.queue.ticketNumber) {
      throw new Error('You already have an active ticket for today');
    }
    const ticketNumber = 'A-014';
    state.queue = {
      ...createInitialQueue(),
      ticketNumber,
      reason: input.reason,
      slot: input.slot,
      notes: input.notes,
      predictedWaitMinutes: input.slot === '09-11' ? 40 : input.slot === '11-13' ? 28 : 22,
      positionMovedAlert: null,
      onSite: false,
    };
    state.patient.lastTicketNumber = ticketNumber;
    state.notifications.unshift({
      id: `n-${Date.now()}`,
      type: NotificationType.QueueConfirmed,
      title: 'Queue slot confirmed',
      body: `You've joined today's queue (${TIME_SLOT_LABELS[input.slot]}) — ticket ${ticketNumber}.`,
      createdAt: nowIso(),
      readAt: null,
    });
    return dashboard();
  },

  async leaveQueue() {
    await delay();
    assertSession();
    state.queue = {
      ticketNumber: null,
      stage: null,
      predictedWaitMinutes: null,
      currentlyServing: state.queue.currentlyServing,
      patientsAhead: 0,
      totalInQueue: Math.max(0, state.queue.totalInQueue - 1),
      positionMovedAlert: null,
      onSite: false,
      timeline: [],
    };
    return dashboard();
  },

  async getVisits() {
    await delay();
    assertSession();
    return state.visits.map((v) => ({ ...v }));
  },

  async getNotifications() {
    await delay();
    assertSession();
    return state.notifications.map((n) => ({ ...n }));
  },

  async markNotificationsRead() {
    await delay(100);
    assertSession();
    const stamp = nowIso();
    state.notifications = state.notifications.map((n) =>
      n.readAt ? n : { ...n, readAt: stamp },
    );
    return unreadCount();
  },

  async updateProfile(input: Partial<Pick<PatientProfile, 'fullName' | 'dateOfBirth' | 'address'>>) {
    await delay();
    assertSession();
    state.patient = { ...state.patient, ...input };
    return { ...state.patient };
  },

  async requestPhoneChange(newPhoneLocal: string) {
    await delay();
    assertSession();
    const phoneE164 = toE164FromLocal(newPhoneLocal);
    const challengeId = `chal-phone-${Date.now()}`;
    state.challenges.set(challengeId, {
      challengeId,
      phoneE164,
      purpose: 'phone_change',
      expiresInSeconds: 300,
      code: DEMO_OTP,
      pendingPhoneE164: phoneE164,
    });
    return { challengeId, phoneE164, expiresInSeconds: 300 };
  },

  async getCheckIn() {
    await delay();
    assertSession();
    if (Date.now() > state.checkInExpiresAt) {
      state.checkInToken = `EF-CHK-${Date.now().toString(36).toUpperCase()}`;
      state.checkInExpiresAt = Date.now() + 5 * 60_000;
    }
    return {
      token: state.checkInToken,
      ticketNumber: state.queue.ticketNumber ?? '—',
      expiresAt: new Date(state.checkInExpiresAt).toISOString(),
      payload: JSON.stringify({
        v: 1,
        ticket: state.queue.ticketNumber,
        token: state.checkInToken,
        patientId: state.patient.id,
      }),
    };
  },

  async refreshCheckIn() {
    await delay(200);
    assertSession();
    state.checkInToken = `EF-CHK-${Date.now().toString(36).toUpperCase()}`;
    state.checkInExpiresAt = Date.now() + 5 * 60_000;
    return this.getCheckIn();
  },

  demoOtpHint() {
    return DEMO_OTP;
  },
};
