import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { createHash, randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import {
  QUEUE_EVENTS,
  TicketPriority,
  TicketStage,
  UserRole,
  VisitReason,
} from '@echoflow/types';
import {
  AuthUser,
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '../common/auth';
import { DatabaseModule } from '../database/database.module';
import {
  AuditLog,
  CheckInChallenge,
  EchoRoom,
  Queue,
  QueueTicket,
  Visit,
} from '../database/schemas';
import {
  AuditCategory,
  PresenceMode,
  QueueStatus,
  SubjectType,
  VisitStatus,
} from '../database/enums';
import { RealtimeGateway, RealtimeModule } from '../realtime/realtime.module';

class JoinQueueDto {
  @IsEnum(VisitReason) reason!: VisitReason;
  @IsString() slot!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() roomId?: string;
}
class PriorityDto {
  @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
}
class CompleteDto {
  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsString() clinicalNote?: string;
}
class CheckInVerifyDto {
  @IsString() token!: string;
  @IsOptional() @IsBoolean() presenceConfirmed?: boolean;
}

@Injectable()
class QueueTicketsService {
  private readonly activeStages = [
    TicketStage.Waiting,
    TicketStage.CheckedIn,
    TicketStage.NowServing,
    TicketStage.Scanning,
    TicketStage.Skipped,
  ];

  constructor(
    @InjectModel(Queue.name) private readonly queues: Model<Queue>,
    @InjectModel(QueueTicket.name) private readonly tickets: Model<QueueTicket>,
    @InjectModel(EchoRoom.name) private readonly rooms: Model<EchoRoom>,
    @InjectModel(Visit.name) private readonly visits: Model<Visit>,
    @InjectModel(CheckInChallenge.name) private readonly checkIns: Model<CheckInChallenge>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
    private readonly realtime: RealtimeGateway,
  ) {}

  today() {
    return new Date().toISOString().slice(0, 10);
  }
  async getToday() {
    const serviceDate = this.today();
    const queue = await this.queues.findOne({ serviceDate, unitCode: 'ECHO' }).lean();
    if (!queue) return { serviceDate, status: QueueStatus.Open, tickets: [] };
    const tickets = await this.tickets
      .find({ queueId: queue._id })
      .sort({ priority: -1, orderKey: 1 })
      .populate('patientId', 'fullName nic phoneE164')
      .populate('roomId', 'name status')
      .lean();
    return { ...queue, tickets };
  }
  async options() {
    return {
      serviceDate: this.today(),
      reasons: Object.values(VisitReason),
      slots: ['09-11', '11-13', '14-16'],
      rooms: await this.rooms.find({}).sort({ name: 1 }).lean(),
    };
  }
  async join(patientId: string, dto: JoinQueueDto) {
    const serviceDate = this.today();
    const patientObjectId = new Types.ObjectId(patientId);
    const active = await this.tickets.findOne({
      patientId: patientObjectId,
      serviceDate,
      stage: { $in: this.activeStages },
    });
    if (active) throw new BadRequestException('Patient already has an active ticket today');
    const queue = await this.queues.findOneAndUpdate(
      { serviceDate, unitCode: 'ECHO' },
      {
        $setOnInsert: { status: QueueStatus.Open, revision: 0, nextTicketSeq: 0 },
        $inc: { nextTicketSeq: 1, revision: 1 },
      },
      { new: true, upsert: true },
    );
    if (queue.status !== QueueStatus.Open) throw new BadRequestException('Queue is closed');
    const seq = queue.nextTicketSeq;
    const ticket = await this.tickets.create({
      queueId: queue._id,
      serviceDate,
      ticketNumber: `A-${String(seq).padStart(3, '0')}`,
      patientId: patientObjectId,
      roomId: dto.roomId ? new Types.ObjectId(dto.roomId) : null,
      reason: dto.reason,
      slot: dto.slot,
      notes: dto.notes ?? '',
      priority: TicketPriority.Normal,
      stage: TicketStage.Waiting,
      orderKey: seq,
      predictedWaitMinutes: await this.estimateWait(queue._id),
    });
    this.realtime.emitQueue(QUEUE_EVENTS.TicketCreated, serviceDate, ticket);
    this.realtime.emitPatient(QUEUE_EVENTS.TicketCreated, patientId, ticket);
    return ticket;
  }
  private async estimateWait(queueId: Types.ObjectId) {
    return (await this.tickets.countDocuments({
      queueId,
      stage: { $in: [TicketStage.Waiting, TicketStage.CheckedIn] },
    })) * 12;
  }
  current(patientId: string) {
    return this.tickets
      .findOne({
        patientId: new Types.ObjectId(patientId),
        serviceDate: this.today(),
        stage: { $in: this.activeStages },
      })
      .populate('roomId', 'name location status')
      .lean();
  }
  async tracking(id: string, user: AuthUser) {
    const ticket = await this.tickets.findById(id).lean();
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (user.typ === 'patient' && String(ticket.patientId) !== user.sub) {
      throw new ForbiddenException();
    }
    const peopleAhead = await this.tickets.countDocuments({
      queueId: ticket.queueId,
      stage: { $in: [TicketStage.Waiting, TicketStage.CheckedIn] },
      $or: [
        { priority: TicketPriority.Urgent, orderKey: { $lt: ticket.orderKey } },
        ...(ticket.priority === TicketPriority.Normal
          ? [{ priority: TicketPriority.Urgent }]
          : []),
        { priority: ticket.priority, orderKey: { $lt: ticket.orderKey } },
      ],
    });
    const totalInQueue = await this.tickets.countDocuments({
      queueId: ticket.queueId,
      stage: { $in: this.activeStages },
    });
    const serving = await this.tickets
      .findOne({ queueId: ticket.queueId, stage: TicketStage.NowServing })
      .lean();
    const neighbors = await this.tickets
      .find({
        queueId: ticket.queueId,
        stage: { $in: [...this.activeStages, TicketStage.Complete] },
      })
      .sort({ orderKey: 1 })
      .limit(8)
      .lean();
    const timeline = neighbors.map((item) => {
      const isYou = String(item._id) === String(ticket._id);
      let stage: 'completed' | 'in_progress' | 'next_up' | 'you' | 'waiting' = 'waiting';
      let label = 'In queue';
      if (item.stage === TicketStage.Complete) {
        stage = 'completed';
        label = 'Completed';
      } else if (item.stage === TicketStage.NowServing || item.stage === TicketStage.Scanning) {
        stage = 'in_progress';
        label = 'In progress';
      } else if (isYou) {
        stage = 'you';
        label = 'YOU ARE HERE';
      } else if (item.orderKey === ticket.orderKey - 1) {
        stage = 'next_up';
        label = 'NEXT UP';
      }
      return {
        ticketNumber: item.ticketNumber,
        stage,
        label,
        etaMinutes: Math.max(0, (item.orderKey - (serving?.orderKey ?? 0)) * 4),
        isYou,
      };
    });
    return {
      ticket,
      peopleAhead,
      patientsAhead: peopleAhead,
      totalInQueue,
      currentlyServing: serving?.ticketNumber ?? null,
      estimatedWaitMinutes: peopleAhead * 12,
      timeline,
      positionMovedAlert: ticket.onSite
        ? null
        : 'Your position may move if an on-site patient checks in with a verified QR.',
    };
  }
  async leave(id: string, patientId: string) {
    const ticket = await this.tickets.findOneAndUpdate(
      { _id: id, patientId, stage: { $in: this.activeStages } },
      { stage: TicketStage.Cancelled, cancelledAt: new Date() },
      { new: true },
    );
    if (!ticket) throw new NotFoundException('Active ticket not found');
    await this.bump(ticket.queueId);
    this.realtime.emitQueue(QUEUE_EVENTS.TicketCancelled, ticket.serviceDate, ticket);
    return ticket;
  }
  private async requireTicket(id: string) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
  private async bump(queueId: Types.ObjectId) {
    await this.queues.updateOne({ _id: queueId }, { $inc: { revision: 1 } });
  }
  private actorRole(user: AuthUser) {
    return user.typ === 'admin' ? SubjectType.Admin : SubjectType.Staff;
  }
  private async audit(user: AuthUser, action: string, ticket: QueueTicket & { _id: Types.ObjectId }) {
    await this.audits.create({
      actorId: new Types.ObjectId(user.sub),
      actorRole: this.actorRole(user),
      action,
      category: AuditCategory.Staff,
      targetType: 'QueueTicket',
      targetId: ticket._id,
    });
  }
  async transition(id: string, stage: TicketStage, user: AuthUser) {
    const ticket = await this.requireTicket(id);
    if ([TicketStage.Complete, TicketStage.Cancelled].includes(ticket.stage)) {
      throw new BadRequestException('Ticket is no longer active');
    }
    ticket.stage = stage;
    ticket.assignedStaffId = new Types.ObjectId(user.sub);
    if (stage === TicketStage.NowServing) ticket.calledAt = new Date();
    if (stage === TicketStage.Skipped) ticket.skippedAt = new Date();
    await ticket.save();
    if (stage === TicketStage.NowServing) {
      await this.queues.updateOne(
        { _id: ticket.queueId },
        { servingTicketId: ticket._id, $inc: { revision: 1 } },
      );
    } else await this.bump(ticket.queueId);
    const event =
      stage === TicketStage.NowServing
        ? QUEUE_EVENTS.TicketCalled
        : QUEUE_EVENTS.TicketSkipped;
    await this.audit(user, `queue.ticket.${stage}`, ticket);
    this.realtime.emitQueue(event, ticket.serviceDate, ticket);
    this.realtime.emitPatient(event, String(ticket.patientId), ticket);
    return ticket;
  }
  async complete(id: string, dto: CompleteDto, user: AuthUser) {
    const ticket = await this.requireTicket(id);
    if (ticket.stage === TicketStage.Complete) throw new BadRequestException('Already complete');
    ticket.stage = TicketStage.Complete;
    ticket.completedAt = new Date();
    ticket.assignedStaffId = new Types.ObjectId(user.sub);
    await ticket.save();
    const visit = await this.visits.create({
      patientId: ticket.patientId,
      ticketId: ticket._id,
      serviceDate: ticket.serviceDate,
      visitType: ticket.reason,
      staffId: ticket.assignedStaffId,
      summary: dto.summary ?? 'ECHO visit completed',
      clinicalNote: dto.clinicalNote ?? '',
      status: VisitStatus.Completed,
    });
    await this.queues.updateOne(
      { _id: ticket.queueId },
      { servingTicketId: null, $inc: { revision: 1 } },
    );
    await this.audit(user, 'queue.ticket.complete', ticket);
    this.realtime.emitQueue(QUEUE_EVENTS.TicketCompleted, ticket.serviceDate, ticket);
    this.realtime.emitPatient(QUEUE_EVENTS.TicketCompleted, String(ticket.patientId), ticket);
    return { ticket, visit };
  }
  async priority(id: string, value: TicketPriority, user: AuthUser) {
    const ticket = await this.requireTicket(id);
    ticket.priority = value;
    await ticket.save();
    await this.bump(ticket.queueId);
    await this.audit(user, 'queue.ticket.priority_changed', ticket);
    this.realtime.emitQueue(QUEUE_EVENTS.TicketPriorityChanged, ticket.serviceDate, ticket);
    return ticket;
  }
  async callNext(user: AuthUser) {
    const queue = await this.queues.findOne({ serviceDate: this.today(), unitCode: 'ECHO' });
    if (!queue) throw new NotFoundException('Queue not found');
    const ticket = await this.tickets.findOne({
      queueId: queue._id,
      stage: { $in: [TicketStage.Waiting, TicketStage.CheckedIn, TicketStage.Skipped] },
    }).sort({ priority: -1, orderKey: 1 });
    if (!ticket) throw new NotFoundException('No waiting tickets');
    return this.transition(ticket.id, TicketStage.NowServing, user);
  }
  async makeCheckInCode(id: string, patientId: string) {
    const ticket = await this.tickets.findOne({ _id: id, patientId, stage: { $in: this.activeStages } });
    if (!ticket) throw new NotFoundException('Active ticket not found');
    const token = randomBytes(24).toString('base64url');
    await this.checkIns.create({
      ticketId: ticket._id,
      tokenHash: createHash('sha256').update(token).digest('hex'),
      publicToken: token,
      expiresAt: new Date(Date.now() + 10 * 60_000),
      presenceMode: PresenceMode.Demo,
    });
    return { token, expiresIn: 600, presenceMode: PresenceMode.Demo };
  }
  async verifyCheckIn(dto: CheckInVerifyDto, user: AuthUser) {
    const hash = createHash('sha256').update(dto.token).digest('hex');
    const challenge = await this.checkIns.findOne({
      tokenHash: hash,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!challenge) throw new BadRequestException('Check-in code is invalid or expired');
    if (dto.presenceConfirmed === false) throw new BadRequestException('Presence not confirmed');
    const ticket = await this.requireTicket(String(challenge.ticketId));
    ticket.stage = TicketStage.CheckedIn;
    ticket.onSite = true;
    ticket.priority = TicketPriority.Urgent;
    await ticket.save();
    challenge.consumedAt = new Date();
    challenge.verifiedByStaffId = new Types.ObjectId(user.sub);
    await challenge.save();
    await this.audit(user, 'queue.check_in.verified', ticket);
    this.realtime.emitQueue(QUEUE_EVENTS.CheckInVerified, ticket.serviceDate, ticket);
    this.realtime.emitPatient(QUEUE_EVENTS.CheckInVerified, String(ticket.patientId), ticket);
    return ticket;
  }
}

@Controller('queues')
@UseGuards(JwtAuthGuard, RolesGuard)
class QueuesController {
  constructor(private readonly service: QueueTicketsService) {}
  @Get('today') getToday() { return this.service.getToday(); }
  @Get('today/options') options() { return this.service.options(); }
  @Post('today/call-next')
  @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  callNext(@CurrentUser() user: AuthUser) { return this.service.callNext(user); }
}

@Controller('queue-tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
class QueueTicketsController {
  constructor(private readonly service: QueueTicketsService) {}
  @Post() @Roles(UserRole.Patient)
  join(@CurrentUser() user: AuthUser, @Body() dto: JoinQueueDto) {
    return this.service.join(user.sub, dto);
  }
  @Get('current') @Roles(UserRole.Patient)
  current(@CurrentUser() user: AuthUser) { return this.service.current(user.sub); }
  @Get(':id/tracking')
  tracking(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.tracking(id, user);
  }
  @Post(':id/leave') @Roles(UserRole.Patient)
  leave(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.leave(id, user.sub);
  }
  @Post(':id/call') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  call(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.transition(id, TicketStage.NowServing, user);
  }
  @Post(':id/skip') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  skip(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.transition(id, TicketStage.Skipped, user);
  }
  @Post(':id/complete') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  complete(@Param('id') id: string, @Body() dto: CompleteDto, @CurrentUser() user: AuthUser) {
    return this.service.complete(id, dto, user);
  }
  @Post(':id/priority') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  priority(@Param('id') id: string, @Body() dto: PriorityDto, @CurrentUser() user: AuthUser) {
    return this.service.priority(id, dto.priority ?? TicketPriority.Urgent, user);
  }
  @Post(':id/check-in-code') @Roles(UserRole.Patient)
  code(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.makeCheckInCode(id, user.sub);
  }
}

@Controller('check-ins')
@UseGuards(JwtAuthGuard, RolesGuard)
class CheckInsController {
  constructor(private readonly service: QueueTicketsService) {}
  @Post('verify') @Roles(UserRole.Technician, UserRole.RoomLead, UserRole.SuperAdmin)
  verify(@Body() dto: CheckInVerifyDto, @CurrentUser() user: AuthUser) {
    return this.service.verifyCheckIn(dto, user);
  }
}

@Module({
  imports: [DatabaseModule, RealtimeModule],
  controllers: [QueuesController, QueueTicketsController, CheckInsController],
  providers: [QueueTicketsService],
})
export class QueueTicketsModule {}
