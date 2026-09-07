import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TicketPriority, TicketStage, VisitReason } from '../enums';

export type QueueTicketDocument = HydratedDocument<QueueTicket>;

@Schema({ timestamps: true, collection: 'queue_tickets' })
export class QueueTicket {
  @Prop({ type: Types.ObjectId, ref: 'Queue', required: true, index: true })
  queueId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  serviceDate!: string;

  @Prop({ required: true, trim: true, index: true })
  ticketNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EchoRoom', default: null, index: true })
  roomId!: Types.ObjectId | null;

  @Prop({ type: String, enum: VisitReason, required: true })
  reason!: VisitReason;

  @Prop({ type: String, required: true })
  slot!: string;

  @Prop({ trim: true, default: '' })
  notes!: string;

  @Prop({ type: String, enum: TicketPriority, default: TicketPriority.Normal, index: true })
  priority!: TicketPriority;

  @Prop({ type: Boolean, default: false })
  onSite!: boolean;

  @Prop({ type: String, enum: TicketStage, default: TicketStage.Waiting, index: true })
  stage!: TicketStage;

  /** Lower values are served earlier within the same priority band. */
  @Prop({ type: Number, required: true, index: true })
  orderKey!: number;

  @Prop({ type: Number, default: null })
  predictedWaitMinutes!: number | null;

  @Prop({ type: Types.ObjectId, ref: 'StaffMember', default: null })
  assignedStaffId!: Types.ObjectId | null;

  @Prop({ type: Date, default: () => new Date() })
  joinedAt!: Date;

  @Prop({ type: Date, default: null })
  calledAt!: Date | null;

  @Prop({ type: Date, default: null })
  skippedAt!: Date | null;

  @Prop({ type: Date, default: null })
  completedAt!: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt!: Date | null;
}

export const QueueTicketSchema = SchemaFactory.createForClass(QueueTicket);
QueueTicketSchema.index({ queueId: 1, stage: 1, orderKey: 1 });
QueueTicketSchema.index({ patientId: 1, serviceDate: 1, stage: 1 });
QueueTicketSchema.index({ ticketNumber: 1, serviceDate: 1 }, { unique: true });
