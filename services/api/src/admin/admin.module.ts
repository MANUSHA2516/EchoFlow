import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsObject, IsOptional } from 'class-validator';
import { Model, Types } from 'mongoose';
import { UserRole } from '@echoflow/types';
import { AuthUser, CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import {
  AuditLog,
  EchoRoom,
  Patient,
  QueueTicket,
  StaffMember,
  SystemSettings,
} from '../database/schemas';
import { AuditCategory, SubjectType } from '../database/enums';

class SettingsDto {
  @IsOptional() @IsObject() permissions?: Record<string, Record<string, boolean>>;
  @IsOptional() @IsObject() securityPolicy?: Record<string, unknown>;
  @IsOptional() @IsObject() aiEngine?: Record<string, unknown>;
}

@Injectable()
class AdminService {
  constructor(
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(StaffMember.name) private readonly staff: Model<StaffMember>,
    @InjectModel(EchoRoom.name) private readonly rooms: Model<EchoRoom>,
    @InjectModel(QueueTicket.name) private readonly tickets: Model<QueueTicket>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
    @InjectModel(SystemSettings.name) private readonly settings: Model<SystemSettings>,
  ) {}
  async dashboard() {
    const serviceDate = new Date().toISOString().slice(0, 10);
    const [patients, staff, rooms, waiting, completed, urgent, recentAudit] = await Promise.all([
      this.patients.countDocuments(),
      this.staff.countDocuments(),
      this.rooms.countDocuments(),
      this.tickets.countDocuments({ serviceDate, stage: { $in: ['waiting', 'checked_in', 'skipped'] } }),
      this.tickets.countDocuments({ serviceDate, stage: 'complete' }),
      this.tickets.countDocuments({ serviceDate, priority: 'urgent', stage: { $nin: ['complete', 'cancelled'] } }),
      this.audits.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    return { serviceDate, patients, staff, rooms, waiting, completed, urgent, recentAudit };
  }
  logs(category?: string, action?: string) {
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (action) filter.action = { $regex: action, $options: 'i' };
    return this.audits.find(filter).sort({ createdAt: -1 }).limit(250).lean();
  }
  async getSettings() {
    return this.settings.findOneAndUpdate(
      { key: 'default' },
      { $setOnInsert: { key: 'default' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
  }
  async updateSettings(dto: SettingsDto, user: AuthUser) {
    const sets: Record<string, unknown> = {};
    for (const [group, values] of Object.entries(dto)) {
      for (const [key, value] of Object.entries(values ?? {})) {
        sets[`${group}.${key}`] = value;
      }
    }
    const settings = await this.settings.findOneAndUpdate(
      { key: 'default' },
      { $set: sets, $setOnInsert: { key: 'default' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await this.audits.create({
      actorId: new Types.ObjectId(user.sub),
      actorRole: SubjectType.Admin,
      action: 'settings.updated',
      category: AuditCategory.Security,
      targetType: 'SystemSettings',
      targetId: settings._id,
    });
    return settings;
  }
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SuperAdmin)
class AdminController {
  constructor(private readonly service: AdminService) {}
  @Get('dashboard') dashboard() { return this.service.dashboard(); }
}
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SuperAdmin)
class AuditController {
  constructor(private readonly service: AdminService) {}
  @Get() logs(@Query('category') category?: string, @Query('action') action?: string) {
    return this.service.logs(category, action);
  }
}
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SuperAdmin)
class SettingsController {
  constructor(private readonly service: AdminService) {}
  @Get() get() { return this.service.getSettings(); }
  @Patch() update(@Body() dto: SettingsDto, @CurrentUser() user: AuthUser) {
    return this.service.updateSettings(dto, user);
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController, AuditController, SettingsController],
  providers: [AdminService],
})
export class AdminModule {}
