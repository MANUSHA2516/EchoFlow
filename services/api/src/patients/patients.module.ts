import {
  Body,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '@echoflow/types';
import { DatabaseModule } from '../database/database.module';
import {
  AuditLog,
  Notification,
  Patient,
  QueueTicket,
  Visit,
} from '../database/schemas';
import { AuditCategory, PatientStatus, SubjectType, VisitReason, VisitStatus } from '../database/enums';
import { AuthService } from '../auth/auth.service';
import {
  AuthUser,
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../common/auth';
import { Module } from '@nestjs/common';

class UpdatePatientDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
}
class PhoneChangeDto {
  @IsString() @IsNotEmpty() phone!: string;
}
class CreatePatientDto {
  @IsString() fullName!: string;
  @IsString() nic!: string;
  @IsString() phone!: string;
  @IsDateString() dateOfBirth!: string;
  @IsOptional() @IsString() address?: string;
}
class PatientNoteDto {
  @IsString() @IsNotEmpty() note!: string;
  @IsOptional() @IsString() summary?: string;
}

@Injectable()
class PatientsService {
  constructor(
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
    @InjectModel(QueueTicket.name) private readonly tickets: Model<QueueTicket>,
    @InjectModel(Notification.name) private readonly notifications: Model<Notification>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
    private readonly auth: AuthService,
  ) {}

  private phone(phone: string) {
    return phone.startsWith('0') ? `+94${phone.slice(1)}` : phone;
  }
  async one(id: string) {
    const patient = await this.patients.findById(id).lean();
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }
  update(id: string, dto: UpdatePatientDto) {
    const patch: Record<string, unknown> = { ...dto };
    if (dto.dateOfBirth) patch.dateOfBirth = new Date(dto.dateOfBirth);
    return this.patients.findByIdAndUpdate(id, patch, { new: true }).lean();
  }
  phoneChange(id: string, phone: string) {
    return this.auth.createPhoneChange(id, phone);
  }
  async dashboard(id: string) {
    const serviceDate = new Date().toISOString().slice(0, 10);
    const patientObjectId = new Types.ObjectId(id);
    const [patient, currentTicket, recentVisits, unreadNotifications] = await Promise.all([
      this.one(id),
      this.tickets.findOne({
        patientId: patientObjectId,
        serviceDate,
        stage: { $in: ['waiting', 'checked_in', 'now_serving', 'scanning', 'skipped'] },
      }).lean(),
      this.visits.find({ patientId: patientObjectId }).sort({ serviceDate: -1 }).limit(3).lean(),
      this.notifications.countDocuments({ patientId: patientObjectId, readAt: null }),
    ]);
    return { patient, currentTicket, recentVisits, unreadNotifications };
  }
  visitsFor(id: string) {
    return this.visits.find({ patientId: new Types.ObjectId(id) }).sort({ serviceDate: -1 }).lean();
  }
  search(query?: string) {
    const filter = query
      ? { $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { nic: { $regex: query, $options: 'i' } },
          { phoneE164: { $regex: query, $options: 'i' } },
        ] }
      : {};
    return this.patients.find(filter).sort({ fullName: 1 }).limit(100).lean();
  }
  create(dto: CreatePatientDto) {
    return this.patients.create({
      fullName: dto.fullName,
      nic: dto.nic.toUpperCase(),
      phoneE164: this.phone(dto.phone),
      dateOfBirth: new Date(dto.dateOfBirth),
      address: dto.address ?? '',
      phoneVerifiedAt: null,
      status: PatientStatus.Active,
    });
  }
  async addNote(patientId: string, dto: PatientNoteDto, actor: AuthUser) {
    await this.one(patientId);
    const visit = await this.visits.create({
      patientId: new Types.ObjectId(patientId),
      ticketId: null,
      serviceDate: new Date().toISOString().slice(0, 10),
      visitType: VisitReason.FollowUp,
      staffId: new Types.ObjectId(actor.sub),
      summary: dto.summary ?? 'Staff note',
      clinicalNote: dto.note,
      status: VisitStatus.Completed,
    });
    await this.audits.create({
      actorId: new Types.ObjectId(actor.sub),
      actorRole: SubjectType.Staff,
      action: 'patient.note.created',
      category: AuditCategory.Staff,
      targetType: 'Patient',
      targetId: new Types.ObjectId(patientId),
    });
    return visit;
  }
}

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get('me') @Roles(UserRole.Patient)
  me(@CurrentUser() user: AuthUser) { return this.service.one(user.sub); }
  @Patch('me') @Roles(UserRole.Patient)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdatePatientDto) {
    return this.service.update(user.sub, dto);
  }
  @Post('me/phone-change') @Roles(UserRole.Patient)
  phoneChange(@CurrentUser() user: AuthUser, @Body() dto: PhoneChangeDto) {
    return this.service.phoneChange(user.sub, dto.phone);
  }
  @Get('me/dashboard') @Roles(UserRole.Patient)
  dashboard(@CurrentUser() user: AuthUser) { return this.service.dashboard(user.sub); }
  @Get('me/visits') @Roles(UserRole.Patient)
  visits(@CurrentUser() user: AuthUser) { return this.service.visitsFor(user.sub); }

  @Get() @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  search(@Query('search') search?: string) { return this.service.search(search); }
  @Get(':id') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  one(@Param('id') id: string) { return this.service.one(id); }
  @Post() @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  create(@Body() dto: CreatePatientDto) { return this.service.create(dto); }
  @Post(':id/notes') @Roles(UserRole.Technician, UserRole.RoomLead)
  note(@Param('id') id: string, @Body() dto: PatientNoteDto, @CurrentUser() user: AuthUser) {
    return this.service.addNote(id, dto, user);
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
