import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Patient,
  PatientSchema,
  StaffMember,
  StaffMemberSchema,
  Administrator,
  AdministratorSchema,
  RefreshSession,
  RefreshSessionSchema,
  OtpChallenge,
  OtpChallengeSchema,
  PasswordReset,
  PasswordResetSchema,
  EchoRoom,
  EchoRoomSchema,
  Queue,
  QueueSchema,
  QueueTicket,
  QueueTicketSchema,
  CheckInChallenge,
  CheckInChallengeSchema,
  Visit,
  VisitSchema,
  Prediction,
  PredictionSchema,
  Notification,
  NotificationSchema,
  AuditLog,
  AuditLogSchema,
  SystemSettings,
  SystemSettingsSchema,
  SystemAlert,
  SystemAlertSchema,
} from './schemas';

export const DATABASE_MODELS = [
  { name: Patient.name, schema: PatientSchema },
  { name: StaffMember.name, schema: StaffMemberSchema },
  { name: Administrator.name, schema: AdministratorSchema },
  { name: RefreshSession.name, schema: RefreshSessionSchema },
  { name: OtpChallenge.name, schema: OtpChallengeSchema },
  { name: PasswordReset.name, schema: PasswordResetSchema },
  { name: EchoRoom.name, schema: EchoRoomSchema },
  { name: Queue.name, schema: QueueSchema },
  { name: QueueTicket.name, schema: QueueTicketSchema },
  { name: CheckInChallenge.name, schema: CheckInChallengeSchema },
  { name: Visit.name, schema: VisitSchema },
  { name: Prediction.name, schema: PredictionSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: SystemSettings.name, schema: SystemSettingsSchema },
  { name: SystemAlert.name, schema: SystemAlertSchema },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://127.0.0.1:27017/echoflow'),
      }),
    }),
    MongooseModule.forFeature(DATABASE_MODELS),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
