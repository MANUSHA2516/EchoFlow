/** Shared domain enums and DTO shapes for EchoFlow. */

export enum UserRole {
  Patient = 'patient',
  Technician = 'technician',
  RoomLead = 'room_lead',
  SuperAdmin = 'super_admin',
}

export enum TicketPriority {
  Normal = 'normal',
  Urgent = 'urgent',
}

export enum TicketStage {
  Waiting = 'waiting',
  CheckedIn = 'checked_in',
  NowServing = 'now_serving',
  Scanning = 'scanning',
  Complete = 'complete',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
}

export enum RoomStatus {
  Live = 'live',
  Delayed = 'delayed',
  Offline = 'offline',
  OffUnit = 'off_unit',
}

export enum RoomType {
  Standard = 'standard',
  Stress = 'stress',
  Tee = 'tee',
  Pediatric = 'pediatric',
  Portable = 'portable',
}

export enum StaffAccountStatus {
  Active = 'active',
  Pending = 'pending',
  Suspended = 'suspended',
}

export enum VisitStatus {
  Completed = 'completed',
  Archived = 'archived',
}

export enum NotificationType {
  PositionMoved = 'position_moved',
  Proximity = 'proximity',
  CheckedIn = 'checked_in',
  QueueConfirmed = 'queue_confirmed',
  AppointmentReminder = 'appointment_reminder',
}

export enum AuditCategory {
  Staff = 'staff',
  Security = 'security',
  AiSystem = 'ai_system',
}

export enum VisitReason {
  RoutineEcho = 'routine_echo',
  FollowUp = 'follow_up',
  DoctorReferral = 'doctor_referral',
}

export type TimeSlot = '09-11' | '11-13' | '14-16';

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  '09-11': '9–11 AM',
  '11-13': '11–1 PM',
  '14-16': '2–4 PM',
};

export const VISIT_REASON_LABELS: Record<VisitReason, string> = {
  [VisitReason.RoutineEcho]: 'Routine ECHO scan',
  [VisitReason.FollowUp]: 'Follow-up consultation',
  [VisitReason.DoctorReferral]: 'Doctor referral scan',
};

/** Socket.IO domain events (MongoDB remains source of truth). */
export const QUEUE_EVENTS = {
  TicketCreated: 'queue.ticket.created',
  TicketCalled: 'queue.ticket.called',
  TicketSkipped: 'queue.ticket.skipped',
  TicketCompleted: 'queue.ticket.completed',
  TicketCancelled: 'queue.ticket.cancelled',
  TicketPriorityChanged: 'queue.ticket.priority_changed',
  PositionChanged: 'queue.position.changed',
  CheckInVerified: 'queue.check_in.verified',
  RoomUpdated: 'queue.room.updated',
  PredictionUpdated: 'prediction.updated',
  NotificationCreated: 'notification.created',
  NotificationRead: 'notification.read',
  SystemAlertCreated: 'system.alert.created',
} as const;

export type QueueEventName = (typeof QUEUE_EVENTS)[keyof typeof QUEUE_EVENTS];

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface WaitTimePrediction {
  minutes: number;
  modelVersion: string;
  confidence?: number;
  dataProvenance: 'synthetic' | 'operational';
  generatedAt: string;
}
