import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { RealtimeModule } from './realtime/realtime.module';
import { PatientsModule } from './patients/patients.module';
import { QueueTicketsModule } from './queue-tickets/queue-tickets.module';
import { EchoRoomsModule } from './echo-rooms/echo-rooms.module';
import { StaffModule } from './staff/staff.module';
import { AdminModule } from './admin/admin.module';
import { PredictionsModule } from './predictions/predictions.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    RealtimeModule,
    PatientsModule,
    QueueTicketsModule,
    EchoRoomsModule,
    StaffModule,
    AdminModule,
    PredictionsModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
