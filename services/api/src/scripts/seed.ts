/**
 * Fictional demonstration seed for EchoFlow.
 * Aligns sample display values with UI mockups where useful.
 * Does not represent real patients, staff, or clinical measurements.
 */
import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { connect, connection, Types } from 'mongoose';
import {
  Patient,
  PatientSchema,
  StaffMember,
  StaffMemberSchema,
  Administrator,
  AdministratorSchema,
  EchoRoom,
  EchoRoomSchema,
  Queue,
  QueueSchema,
  QueueTicket,
  QueueTicketSchema,
  Visit,
  VisitSchema,
  Notification,
  NotificationSchema,
  AuditLog,
  AuditLogSchema,
  SystemSettings,
  SystemSettingsSchema,
  SystemAlert,
  SystemAlertSchema,
} from '../database/schemas';
import {
  PatientStatus,
  StaffAccountStatus,
  RoomStatus,
  RoomType,
  QueueStatus,
  TicketPriority,
  TicketStage,
  VisitReason,
  VisitStatus,
  NotificationType,
  AuditCategory,
  SubjectType,
  AlertSeverity,
  UserRole,
} from '../database/enums';

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/echoflow';
  await connect(uri);

  const PatientModel = connection.model(Patient.name, PatientSchema);
  const StaffModel = connection.model(StaffMember.name, StaffMemberSchema);
  const AdminModel = connection.model(Administrator.name, AdministratorSchema);
  const RoomModel = connection.model(EchoRoom.name, EchoRoomSchema);
  const QueueModel = connection.model(Queue.name, QueueSchema);
  const TicketModel = connection.model(QueueTicket.name, QueueTicketSchema);
  const VisitModel = connection.model(Visit.name, VisitSchema);
  const NotificationModel = connection.model(Notification.name, NotificationSchema);
  const AuditModel = connection.model(AuditLog.name, AuditLogSchema);
  const SettingsModel = connection.model(SystemSettings.name, SystemSettingsSchema);
  const AlertModel = connection.model(SystemAlert.name, SystemAlertSchema);

  await Promise.all([
    PatientModel.deleteMany({}),
    StaffModel.deleteMany({}),
    AdminModel.deleteMany({}),
    RoomModel.deleteMany({}),
    QueueModel.deleteMany({}),
    TicketModel.deleteMany({}),
    VisitModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    AuditModel.deleteMany({}),
    SettingsModel.deleteMany({}),
    AlertModel.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('EchoFlow!demo', 12);
  const today = new Date();
  const serviceDate = today.toISOString().slice(0, 10);

  const rooms = await RoomModel.insertMany([
    {
      name: 'Echo Room 1',
      type: RoomType.Standard,
      location: 'Level 2, Wing B',
      status: RoomStatus.Live,
      isLive: true,
      capacity: 8,
      technicianCount: 1,
    },
    {
      name: 'Echo Room 2',
      type: RoomType.Standard,
      location: 'Level 2, Wing B',
      status: RoomStatus.Live,
      isLive: true,
      capacity: 8,
      technicianCount: 1,
    },
    {
      name: 'Stress Echo Suite',
      type: RoomType.Stress,
      location: 'Level 2, Wing C',
      status: RoomStatus.Delayed,
      isLive: true,
      capacity: 6,
      technicianCount: 1,
    },
    {
      name: 'TEE Suite',
      type: RoomType.Tee,
      location: 'Level 3, Wing A',
      status: RoomStatus.Live,
      isLive: true,
      capacity: 4,
      technicianCount: 1,
    },
    {
      name: 'Pediatric Echo',
      type: RoomType.Pediatric,
      location: 'Level 1, Wing A',
      status: RoomStatus.Live,
      isLive: true,
      capacity: 5,
      technicianCount: 1,
    },
    {
      name: 'Portable/Bedside Unit',
      type: RoomType.Portable,
      location: 'Mobile',
      status: RoomStatus.OffUnit,
      isLive: false,
      capacity: 3,
      technicianCount: 0,
    },
  ]);

  const staff = await StaffModel.insertMany([
    {
      staffId: 'ECHO-STF-001',
      fullName: 'N. Bandara',
      email: 'n.bandara@echoflow.demo',
      phone: '+94771234501',
      passwordHash,
      role: UserRole.Technician,
      assignedRoomId: rooms[0]!._id,
      status: StaffAccountStatus.Active,
      lastActiveAt: new Date(),
    },
    {
      staffId: 'ECHO-STF-002',
      fullName: 'Amara Silva',
      email: 'a.silva@echoflow.demo',
      phone: '+94771234502',
      passwordHash,
      role: UserRole.RoomLead,
      assignedRoomId: rooms[1]!._id,
      status: StaffAccountStatus.Active,
      lastActiveAt: new Date(),
    },
    {
      staffId: 'ECHO-STF-003',
      fullName: 'M. Fernando',
      email: 'm.fernando@echoflow.demo',
      phone: '+94771234503',
      passwordHash,
      role: UserRole.Technician,
      assignedRoomId: rooms[2]!._id,
      status: StaffAccountStatus.Pending,
    },
  ]);

  await RoomModel.findByIdAndUpdate(rooms[0]!._id, { leadTechnicianId: staff[0]!._id });
  await RoomModel.findByIdAndUpdate(rooms[1]!._id, { leadTechnicianId: staff[1]!._id });
  await RoomModel.findByIdAndUpdate(rooms[2]!._id, { leadTechnicianId: staff[2]!._id });

  const admin = await AdminModel.create({
    adminId: 'ECHO-ADM-014',
    fullName: 'D. Jayasuriya',
    email: 'd.jayasuriya@echoflow.demo',
    phone: '+94770000014',
    passwordHash,
    totpSecret: process.env.ADMIN_TOTP_DEMO_SECRET ?? 'JBSWY3DPEHPK3PXP',
    totpEnabled: true,
    role: UserRole.SuperAdmin,
    department: 'ECHO Unit Admin',
    lastLoginAt: new Date(),
  });

  const patient = await PatientModel.create({
    fullName: 'Kasun Perera',
    nic: '200012345678',
    phoneE164: '+94712345678',
    phoneVerifiedAt: new Date(),
    dateOfBirth: new Date('1988-05-14'),
    address: 'Nugegoda',
    status: PatientStatus.Active,
    memberSinceYear: 2026,
  });

  const otherPatients = await PatientModel.insertMany([
    {
      fullName: 'S. Silva',
      nic: '199012340001',
      phoneE164: '+94710000001',
      phoneVerifiedAt: new Date(),
      dateOfBirth: new Date('1990-01-01'),
      address: 'Colombo',
      status: PatientStatus.Active,
    },
    {
      fullName: 'R. Wickramasinghe',
      nic: '198512340002',
      phoneE164: '+94710000002',
      phoneVerifiedAt: new Date(),
      dateOfBirth: new Date('1985-02-02'),
      address: 'Kandy',
      status: PatientStatus.Active,
    },
    {
      fullName: 'N. Bandara',
      nic: '199212340004',
      phoneE164: '+94710000004',
      phoneVerifiedAt: new Date(),
      dateOfBirth: new Date('1992-04-04'),
      address: 'Negombo',
      status: PatientStatus.Active,
    },
    {
      fullName: 'R. Jayawardena',
      nic: '199512340003',
      phoneE164: '+94710000003',
      phoneVerifiedAt: new Date(),
      dateOfBirth: new Date('1995-03-03'),
      address: 'Galle',
      status: PatientStatus.Active,
    },
  ]);

  const queue = await QueueModel.create({
    serviceDate,
    unitCode: 'ECHO',
    status: QueueStatus.Open,
    revision: 1,
    nextTicketSeq: 15,
  });

  const tickets = await TicketModel.insertMany([
    {
      queueId: queue._id,
      serviceDate,
      ticketNumber: 'A-009',
      patientId: otherPatients[0]!._id,
      roomId: rooms[0]!._id,
      reason: VisitReason.RoutineEcho,
      slot: '09-11',
      priority: TicketPriority.Normal,
      stage: TicketStage.NowServing,
      orderKey: 9,
      predictedWaitMinutes: 0,
      assignedStaffId: staff[0]!._id,
      joinedAt: new Date(),
      calledAt: new Date(),
    },
    {
      queueId: queue._id,
      serviceDate,
      ticketNumber: 'A-010',
      patientId: otherPatients[2]!._id,
      roomId: rooms[0]!._id,
      reason: VisitReason.RoutineEcho,
      slot: '09-11',
      priority: TicketPriority.Normal,
      stage: TicketStage.Waiting,
      orderKey: 10,
      predictedWaitMinutes: 15,
      joinedAt: new Date(),
    },
    {
      queueId: queue._id,
      serviceDate,
      ticketNumber: 'A-011',
      patientId: otherPatients[3]!._id,
      roomId: rooms[0]!._id,
      reason: VisitReason.FollowUp,
      slot: '11-13',
      priority: TicketPriority.Normal,
      stage: TicketStage.Waiting,
      orderKey: 11,
      predictedWaitMinutes: 25,
      joinedAt: new Date(),
    },
    {
      queueId: queue._id,
      serviceDate,
      ticketNumber: 'A-012',
      patientId: otherPatients[1]!._id,
      roomId: rooms[0]!._id,
      reason: VisitReason.RoutineEcho,
      slot: '09-11',
      priority: TicketPriority.Urgent,
      stage: TicketStage.Waiting,
      orderKey: 1,
      predictedWaitMinutes: 18,
      joinedAt: new Date(),
    },
    {
      queueId: queue._id,
      serviceDate,
      ticketNumber: 'A-014',
      patientId: patient._id,
      roomId: rooms[0]!._id,
      reason: VisitReason.RoutineEcho,
      slot: '09-11',
      notes: 'Any symptoms or referral details',
      priority: TicketPriority.Normal,
      stage: TicketStage.Waiting,
      orderKey: 14,
      predictedWaitMinutes: 32,
      joinedAt: new Date(),
    },
  ]);

  await QueueModel.findByIdAndUpdate(queue._id, { servingTicketId: tickets[0]!._id });

  await VisitModel.insertMany([
    {
      patientId: patient._id,
      ticketId: null,
      serviceDate: '2026-06-12',
      visitType: VisitReason.RoutineEcho,
      doctorName: 'Dr. Perera',
      status: VisitStatus.Completed,
      summary: 'Routine ECHO scan completed',
    },
    {
      patientId: patient._id,
      ticketId: null,
      serviceDate: '2026-07-03',
      visitType: VisitReason.FollowUp,
      doctorName: 'Dr. Silva',
      status: VisitStatus.Completed,
      summary: 'Follow-up consultation',
    },
    {
      patientId: patient._id,
      ticketId: null,
      serviceDate: '2026-08-20',
      visitType: VisitReason.DoctorReferral,
      doctorName: 'Dr. Fernando',
      status: VisitStatus.Archived,
      summary: 'Doctor referral scan archived',
    },
  ]);

  await NotificationModel.insertMany([
    {
      patientId: patient._id,
      type: NotificationType.PositionMoved,
      title: 'Your position moved back',
      body: 'Another patient checked in on-site (QR verified) and was given priority.',
      ticketId: tickets[4]!._id,
      dedupeKey: `position-moved-${tickets[4]!._id}-seed`,
    },
    {
      patientId: patient._id,
      type: NotificationType.Proximity,
      title: "You're 3 patients away",
      body: 'Head to the Echo Room waiting area now.',
      ticketId: tickets[4]!._id,
      dedupeKey: `proximity-${tickets[4]!._id}-seed`,
    },
    {
      patientId: patient._id,
      type: NotificationType.QueueConfirmed,
      title: 'Queue slot confirmed',
      body: "You've joined today's queue at position #14.",
      ticketId: tickets[4]!._id,
      dedupeKey: `queue-confirmed-${tickets[4]!._id}-seed`,
      readAt: new Date(),
    },
  ]);

  await SettingsModel.create({ key: 'default' });

  await AlertModel.insertMany([
    {
      severity: AlertSeverity.Critical,
      message: 'Stress Echo Suite wait above SLA. 30 min avg vs 20 min target',
      roomId: rooms[2]!._id,
    },
    {
      severity: AlertSeverity.Warning,
      message: '2 technician accounts pending approval. Submitted by room lead',
    },
    {
      severity: AlertSeverity.Info,
      message: 'AI model retrain scheduled. ECHO-ML demo — synthetic provenance',
    },
  ]);

  await AuditModel.create({
    actorId: admin._id,
    actorRole: SubjectType.Admin,
    action: 'seed.database',
    category: AuditCategory.AiSystem,
    targetType: 'system',
    targetId: new Types.ObjectId(),
    metadata: { note: 'Fictional demonstration seed applied' },
  });

  // eslint-disable-next-line no-console
  console.log('EchoFlow demo seed complete.');
  // eslint-disable-next-line no-console
  console.log({
    serviceDate,
    patientNic: '200012345678',
    patientPhone: '+94712345678',
    staffId: 'ECHO-STF-001',
    adminId: 'ECHO-ADM-014',
    password: 'EchoFlow!demo',
    note: 'All data is fictional. OTP uses console provider in development.',
  });

  await connection.close();
}

void seed().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await connection.close();
  process.exit(1);
});
