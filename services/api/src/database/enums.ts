import {
  TicketPriority,
  TicketStage,
  RoomStatus,
  RoomType,
  StaffAccountStatus,
  VisitStatus,
  NotificationType,
  AuditCategory,
  VisitReason,
  UserRole,
} from '@echoflow/types';

export {
  TicketPriority,
  TicketStage,
  RoomStatus,
  RoomType,
  StaffAccountStatus,
  VisitStatus,
  NotificationType,
  AuditCategory,
  VisitReason,
  UserRole,
};

export enum PatientStatus {
  PendingVerification = 'pending_verification',
  Active = 'active',
  Disabled = 'disabled',
}

export enum QueueStatus {
  Open = 'open',
  Closed = 'closed',
}

export enum OtpPurpose {
  PatientLogin = 'patient_login',
  PatientRegister = 'patient_register',
  PhoneChange = 'phone_change',
}

export enum PresenceMode {
  Demo = 'demo',
  Gps = 'gps',
}

export enum PredictionScope {
  Ticket = 'ticket',
  QueueHour = 'queue_hour',
  Day = 'day',
}

export enum AlertSeverity {
  Info = 'info',
  Warning = 'warning',
  Critical = 'critical',
}

export enum SubjectType {
  Patient = 'patient',
  Staff = 'staff',
  Admin = 'admin',
}
