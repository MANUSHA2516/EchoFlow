import {
  NotificationType,
  TicketStage,
  TimeSlot,
  VisitReason,
  VisitStatus,
} from '@echoflow/types';

export type AuthPurpose = 'login' | 'register' | 'phone_change';

export interface PatientProfile {
  id: string;
  fullName: string;
  nic: string;
  phoneE164: string;
  dateOfBirth: string;
  address: string;
  avatarUrl?: string;
  verified: boolean;
  memberSinceYear: number;
  totalVisits: number;
  lastTicketNumber?: string;
}

export interface QueueSnapshot {
  ticketNumber: string | null;
  stage: TicketStage | null;
  predictedWaitMinutes: number | null;
  currentlyServing: string | null;
  patientsAhead: number;
  totalInQueue: number;
  positionMovedAlert: string | null;
  onSite: boolean;
  reason?: VisitReason;
  slot?: TimeSlot;
  notes?: string;
  timeline: TimelineItem[];
}

export interface TimelineItem {
  ticketNumber: string;
  stage: 'completed' | 'in_progress' | 'next_up' | 'you' | 'waiting';
  label: string;
  etaMinutes?: number;
  isYou?: boolean;
}

export interface VisitItem {
  id: string;
  visitType: VisitReason;
  serviceDate: string;
  doctorName: string;
  status: VisitStatus;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface DashboardData {
  patient: PatientProfile;
  queue: QueueSnapshot;
  unreadNotifications: number;
  slotWaitEstimates: Record<TimeSlot, number>;
}

export interface OtpChallenge {
  challengeId: string;
  phoneE164: string;
  purpose: AuthPurpose;
  expiresInSeconds: number;
  /** Registration payload held until OTP verifies */
  pendingRegistration?: {
    fullName: string;
    nic: string;
    phoneE164: string;
    dateOfBirth: string;
  };
  pendingPhoneE164?: string;
}
