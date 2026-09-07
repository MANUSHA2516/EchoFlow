import { config } from './config';
import { tokenStorage } from './tokenStorage';
import type {
  AuthPurpose,
  DashboardData,
  NotificationItem,
  PatientProfile,
  QueueSnapshot,
  TimelineItem,
  VisitItem,
} from '../types/patient';
import {
  NotificationType,
  TicketStage,
  TimeSlot,
  VisitReason,
  VisitStatus,
} from '@echoflow/types';
import { toE164FromLocal } from './format';

type Json = Record<string, unknown>;

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (auth) {
    const access = await tokenStorage.getAccess();
    if (access) headers.set('Authorization', `Bearer ${access}`);
  }
  const res = await fetch(`${config.apiUrl}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function mapPatient(raw: Json): PatientProfile {
  const dob = raw.dateOfBirth ? new Date(String(raw.dateOfBirth)).toISOString() : '';
  return {
    id: String(raw._id ?? raw.id),
    fullName: String(raw.fullName ?? ''),
    nic: String(raw.nic ?? ''),
    phoneE164: String(raw.phoneE164 ?? ''),
    dateOfBirth: dob.slice(0, 10),
    address: String(raw.address ?? ''),
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
    verified: Boolean(raw.phoneVerifiedAt),
    memberSinceYear: Number(raw.memberSinceYear ?? new Date().getFullYear()),
    totalVisits: Number(raw.totalVisits ?? 0),
    lastTicketNumber: raw.lastTicketNumber ? String(raw.lastTicketNumber) : undefined,
  };
}

function mapQueue(ticket: Json | null, extras?: Json): QueueSnapshot {
  if (!ticket) {
    return {
      ticketNumber: null,
      stage: null,
      predictedWaitMinutes: null,
      currentlyServing: extras?.currentlyServing ? String(extras.currentlyServing) : null,
      patientsAhead: 0,
      totalInQueue: Number(extras?.totalInQueue ?? 0),
      positionMovedAlert: null,
      onSite: false,
      timeline: [],
    };
  }
  const timelineRaw = (extras?.timeline ?? ticket.timeline ?? []) as Json[];
  const timeline: TimelineItem[] = timelineRaw.map((item) => ({
    ticketNumber: String(item.ticketNumber),
    stage: (item.stage as TimelineItem['stage']) ?? 'waiting',
    label: String(item.label ?? item.stage ?? ''),
    etaMinutes: item.etaMinutes != null ? Number(item.etaMinutes) : undefined,
    isYou: Boolean(item.isYou),
  }));
  return {
    ticketNumber: String(ticket.ticketNumber),
    stage: (ticket.stage as TicketStage) ?? TicketStage.Waiting,
    predictedWaitMinutes:
      ticket.predictedWaitMinutes != null ? Number(ticket.predictedWaitMinutes) : null,
    currentlyServing: extras?.currentlyServing
      ? String(extras.currentlyServing)
      : ticket.currentlyServing
        ? String(ticket.currentlyServing)
        : null,
    patientsAhead: Number(extras?.patientsAhead ?? ticket.patientsAhead ?? 0),
    totalInQueue: Number(extras?.totalInQueue ?? ticket.totalInQueue ?? 0),
    positionMovedAlert: extras?.positionMovedAlert
      ? String(extras.positionMovedAlert)
      : null,
    onSite: Boolean(ticket.onSite),
    reason: ticket.reason as VisitReason | undefined,
    slot: ticket.slot as TimeSlot | undefined,
    notes: ticket.notes ? String(ticket.notes) : undefined,
    timeline,
  };
}

function mapVisit(raw: Json): VisitItem {
  return {
    id: String(raw._id ?? raw.id),
    visitType: (raw.visitType as VisitReason) ?? VisitReason.RoutineEcho,
    serviceDate: String(raw.serviceDate),
    doctorName: String(raw.doctorName ?? 'ECHO Unit'),
    status: (raw.status as VisitStatus) ?? VisitStatus.Completed,
  };
}

function mapNotification(raw: Json): NotificationItem {
  return {
    id: String(raw._id ?? raw.id),
    type: (raw.type as NotificationType) ?? NotificationType.QueueConfirmed,
    title: String(raw.title),
    body: String(raw.body),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    readAt: raw.readAt ? String(raw.readAt) : null,
  };
}

async function buildDashboard(): Promise<DashboardData> {
  const raw = await request<Json>('/patients/me/dashboard');
  const patient = mapPatient(raw.patient as Json);
  const ticket = (raw.currentTicket as Json | null) ?? null;
  let tracking: Json | null = null;
  if (ticket?._id) {
    try {
      tracking = await request<Json>(`/queue-tickets/${String(ticket._id)}/tracking`);
    } catch {
      tracking = null;
    }
  }
  const queue = mapQueue(ticket, {
    currentlyServing: tracking?.currentlyServing,
    patientsAhead: tracking?.patientsAhead ?? tracking?.peopleAhead ?? (ticket ? 5 : 0),
    totalInQueue: tracking?.totalInQueue ?? 14,
    positionMovedAlert: tracking?.positionMovedAlert,
    timeline: tracking?.timeline,
  });
  if (queue.ticketNumber) patient.lastTicketNumber = queue.ticketNumber;
  return {
    patient,
    queue,
    unreadNotifications: Number(raw.unreadNotifications ?? 0),
    slotWaitEstimates: {
      '09-11': 40,
      '11-13': 28,
      '14-16': 22,
    },
  };
}

export const liveApi = {
  async login(nic: string, phoneLocal: string) {
    const phone = toE164FromLocal(phoneLocal);
    return request<{ challengeId: string; phoneE164: string; expiresIn: number }>(
      '/auth/patient/login',
      { method: 'POST', body: JSON.stringify({ nic, phone }) },
      false,
    );
  },
  async register(input: {
    fullName: string;
    nic: string;
    phoneLocal: string;
    dateOfBirth: string;
  }) {
    const phone = toE164FromLocal(input.phoneLocal);
    return request<{ challengeId: string; phoneE164: string; expiresIn: number }>(
      '/auth/patient/register',
      {
        method: 'POST',
        body: JSON.stringify({
          fullName: input.fullName,
          nic: input.nic,
          phone,
          dateOfBirth: input.dateOfBirth,
        }),
      },
      false,
    );
  },
  async verifyOtp(challengeId: string, code: string) {
    const res = await request<{
      accessToken: string;
      refreshToken: string;
      purpose: string;
      patient: Json;
    }>(
      '/auth/otp/verify',
      { method: 'POST', body: JSON.stringify({ challengeId, code }) },
      false,
    );
    const purpose =
      res.purpose?.includes('register')
        ? ('register' as AuthPurpose)
        : res.purpose?.includes('phone')
          ? ('phone_change' as AuthPurpose)
          : ('login' as AuthPurpose);
    if (purpose === 'login' || purpose === 'phone_change') {
      await tokenStorage.save(res.accessToken, res.refreshToken);
    }
    return { purpose, tokens: res, patient: mapPatient(res.patient) };
  },
  async resendOtp(challengeId: string) {
    return request<{ challengeId: string; expiresIn: number }>(
      '/auth/otp/resend',
      { method: 'POST', body: JSON.stringify({ challengeId }) },
      false,
    );
  },
  async restoreSession(hasToken: boolean) {
    if (!hasToken) return null;
    return buildDashboard();
  },
  async logout() {
    const refresh = await tokenStorage.getRefresh();
    if (refresh) {
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refresh }),
        }, false);
      } catch {
        /* ignore */
      }
    }
    await tokenStorage.clear();
  },
  getDashboard: buildDashboard,
  async joinQueue(input: { reason: VisitReason; slot: TimeSlot; notes?: string }) {
    await request('/queue-tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return buildDashboard();
  },
  async leaveQueue() {
    const current = await request<Json>('/queue-tickets/current');
    if (current?._id) {
      await request(`/queue-tickets/${String(current._id)}/leave`, { method: 'POST' });
    }
    return buildDashboard();
  },
  async getVisits() {
    const rows = await request<Json[]>('/patients/me/visits');
    return rows.map(mapVisit);
  },
  async getNotifications() {
    const rows = await request<Json[]>('/notifications');
    return rows.map(mapNotification);
  },
  async markNotificationsRead() {
    await request('/notifications/read-all', { method: 'POST' });
    return 0;
  },
  async updateProfile(
    input: Partial<Pick<PatientProfile, 'fullName' | 'dateOfBirth' | 'address'>>,
  ) {
    const raw = await request<Json>('/patients/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return mapPatient(raw);
  },
  async requestPhoneChange(newPhoneLocal: string) {
    const phone = toE164FromLocal(newPhoneLocal);
    return request<{ challengeId: string; phoneE164?: string; expiresIn: number }>(
      '/patients/me/phone-change',
      { method: 'POST', body: JSON.stringify({ phone }) },
    ).then((r) => ({ ...r, phoneE164: r.phoneE164 ?? phone }));
  },
  async getCheckIn() {
    const current = await request<Json>('/queue-tickets/current');
    if (!current?._id) throw new Error('No active ticket for check-in');
    const code = await request<{ token: string; expiresIn: number }>(
      `/queue-tickets/${String(current._id)}/check-in-code`,
      { method: 'POST' },
    );
    const expiresAt = new Date(Date.now() + (code.expiresIn ?? 600) * 1000).toISOString();
    return {
      token: code.token,
      ticketNumber: String(current.ticketNumber),
      expiresAt,
      payload: JSON.stringify({
        v: 1,
        ticket: current.ticketNumber,
        token: code.token,
        patientId: current.patientId,
      }),
    };
  },
  async refreshCheckIn() {
    return this.getCheckIn();
  },
  async health() {
    const res = await fetch(`${config.apiUrl.replace(/\/api\/v1$/, '')}/api/v1/health`);
    return res.ok;
  },
};
