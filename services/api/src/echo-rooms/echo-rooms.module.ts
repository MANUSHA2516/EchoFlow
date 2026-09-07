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
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Model, Types } from 'mongoose';
import { QUEUE_EVENTS, RoomStatus, RoomType, UserRole } from '@echoflow/types';
import { AuthUser, CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import { AuditLog, EchoRoom } from '../database/schemas';
import { AuditCategory, SubjectType } from '../database/enums';
import { RealtimeGateway, RealtimeModule } from '../realtime/realtime.module';

class RoomDto {
  @IsString() name!: string;
  @IsEnum(RoomType) type!: RoomType;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() operatingHoursStart?: string;
  @IsOptional() @IsString() operatingHoursEnd?: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}
class UpdateRoomDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(RoomType) type?: RoomType;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() operatingHoursStart?: string;
  @IsOptional() @IsString() operatingHoursEnd?: string;
  @IsOptional() @IsEnum(RoomStatus) status?: RoomStatus;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsBoolean() isLive?: boolean;
  @IsOptional() @IsString() leadTechnicianId?: string;
}

@Injectable()
class EchoRoomsService {
  constructor(
    @InjectModel(EchoRoom.name) private readonly rooms: Model<EchoRoom>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
    private readonly realtime: RealtimeGateway,
  ) {}
  list() { return this.rooms.find().sort({ name: 1 }).populate('leadTechnicianId', 'fullName staffId').lean(); }
  create(dto: RoomDto) { return this.rooms.create(dto); }
  async update(id: string, dto: UpdateRoomDto, user: AuthUser) {
    const room = await this.rooms.findByIdAndUpdate(id, dto, { new: true });
    if (!room) throw new NotFoundException('Room not found');
    await this.audits.create({
      actorId: new Types.ObjectId(user.sub),
      actorRole: SubjectType.Admin,
      action: 'echo_room.updated',
      category: AuditCategory.Staff,
      targetType: 'EchoRoom',
      targetId: room._id,
    });
    this.realtime.server.to('admin').emit(QUEUE_EVENTS.RoomUpdated, room);
    return room;
  }
}

@Controller('echo-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
class EchoRoomsController {
  constructor(private readonly service: EchoRoomsService) {}
  @Get() list() { return this.service.list(); }
  @Post() @Roles(UserRole.SuperAdmin)
  create(@Body() dto: RoomDto) { return this.service.create(dto); }
  @Patch(':id') @Roles(UserRole.SuperAdmin)
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user);
  }
}

@Module({
  imports: [DatabaseModule, RealtimeModule],
  controllers: [EchoRoomsController],
  providers: [EchoRoomsService],
})
export class EchoRoomsModule {}
