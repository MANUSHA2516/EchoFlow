import {
  Body,
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
import * as bcrypt from 'bcryptjs';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Model, Types } from 'mongoose';
import { StaffAccountStatus, UserRole } from '@echoflow/types';
import { AuthUser, CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import { AuditLog, StaffMember } from '../database/schemas';
import { AuditCategory, SubjectType } from '../database/enums';

class CreateStaffDto {
  @IsString() staffId!: string;
  @IsString() fullName!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole.Technician | UserRole.RoomLead;
  @IsOptional() @IsString() assignedRoomId?: string;
}
class UpdateStaffDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(StaffAccountStatus) status?: StaffAccountStatus;
  @IsOptional() @IsString() assignedRoomId?: string;
}
class AccessDto {
  @IsEnum(UserRole) role!: UserRole.Technician | UserRole.RoomLead;
  @IsEnum(StaffAccountStatus) status!: StaffAccountStatus;
  @IsOptional() @IsString() assignedRoomId?: string;
}
class QuickAddDto {
  @IsString() fullName!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() assignedRoomId?: string;
}

@Injectable()
class StaffService {
  constructor(
    @InjectModel(StaffMember.name) private readonly staff: Model<StaffMember>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
  ) {}
  list() {
    return this.staff.find().select('-passwordHash').populate('assignedRoomId', 'name status').sort({ fullName: 1 }).lean();
  }
  async audit(user: AuthUser, action: string, targetId: Types.ObjectId) {
    await this.audits.create({
      actorId: new Types.ObjectId(user.sub),
      actorRole: SubjectType.Admin,
      action,
      category: AuditCategory.Staff,
      targetType: 'StaffMember',
      targetId,
    });
  }
  async create(dto: CreateStaffDto, user: AuthUser) {
    const temporaryPassword = dto.password ?? `EchoFlow!${Math.floor(1000 + Math.random() * 9000)}`;
    const member = await this.staff.create({
      staffId: dto.staffId.toUpperCase(),
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      phone: dto.phone ?? '',
      passwordHash: await bcrypt.hash(temporaryPassword, 12),
      role: dto.role ?? UserRole.Technician,
      assignedRoomId: dto.assignedRoomId ? new Types.ObjectId(dto.assignedRoomId) : null,
      status: StaffAccountStatus.Pending,
    });
    await this.audit(user, 'staff.created', member._id);
    const result = member.toObject() as unknown as Record<string, unknown>;
    delete result.passwordHash;
    return { staff: result, temporaryPassword };
  }
  async update(id: string, dto: UpdateStaffDto, user: AuthUser) {
    const member = await this.staff.findByIdAndUpdate(id, dto, { new: true }).select('-passwordHash');
    if (!member) throw new NotFoundException('Staff member not found');
    await this.audit(user, 'staff.updated', member._id);
    return member;
  }
  async access(id: string, dto: AccessDto, user: AuthUser) {
    const member = await this.staff.findByIdAndUpdate(id, dto, { new: true }).select('-passwordHash');
    if (!member) throw new NotFoundException('Staff member not found');
    await this.audit(user, 'staff.access.updated', member._id);
    return member;
  }
  async quick(dto: QuickAddDto, user: AuthUser) {
    const sequence = (await this.staff.countDocuments()) + 1;
    return this.create({
      staffId: `ECHO-STF-${String(sequence).padStart(3, '0')}`,
      fullName: dto.fullName,
      email: dto.email,
      assignedRoomId: dto.assignedRoomId,
      role: UserRole.Technician,
    }, user);
  }
}

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
class StaffController {
  constructor(private readonly service: StaffService) {}
  @Get() @Roles(UserRole.RoomLead, UserRole.SuperAdmin)
  list() { return this.service.list(); }
  @Post() @Roles(UserRole.SuperAdmin)
  create(@Body() dto: CreateStaffDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }
  @Patch(':id') @Roles(UserRole.SuperAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user);
  }
  @Post(':id/access') @Roles(UserRole.SuperAdmin)
  access(@Param('id') id: string, @Body() dto: AccessDto, @CurrentUser() user: AuthUser) {
    return this.service.access(id, dto, user);
  }
  @Post('quick-add') @Roles(UserRole.SuperAdmin)
  quick(@Body() dto: QuickAddDto, @CurrentUser() user: AuthUser) {
    return this.service.quick(dto, user);
  }
}

@Module({
  imports: [DatabaseModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
