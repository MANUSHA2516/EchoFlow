import {
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QUEUE_EVENTS, UserRole } from '@echoflow/types';
import { AuthUser, CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import { Notification } from '../database/schemas';
import { RealtimeGateway, RealtimeModule } from '../realtime/realtime.module';

@Injectable()
class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notifications: Model<Notification>,
    private readonly realtime: RealtimeGateway,
  ) {}
  list(patientId: string) {
    return this.notifications
      .find({ patientId: new Types.ObjectId(patientId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }
  async read(id: string, patientId: string) {
    const item = await this.notifications.findOneAndUpdate(
      { _id: id, patientId },
      { readAt: new Date() },
      { new: true },
    );
    if (!item) throw new NotFoundException('Notification not found');
    this.realtime.emitPatient(QUEUE_EVENTS.NotificationRead, patientId, item);
    return item;
  }
  async readAll(patientId: string) {
    const result = await this.notifications.updateMany(
      { patientId: new Types.ObjectId(patientId), readAt: null },
      { readAt: new Date() },
    );
    this.realtime.emitPatient(QUEUE_EVENTS.NotificationRead, patientId, { all: true });
    return { updated: result.modifiedCount };
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Patient)
class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() list(@CurrentUser() user: AuthUser) { return this.service.list(user.sub); }
  @Patch(':id/read') read(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.read(id, user.sub);
  }
  @Post('read-all') readAll(@CurrentUser() user: AuthUser) {
    return this.service.readAll(user.sub);
  }
}

@Module({
  imports: [DatabaseModule, RealtimeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
