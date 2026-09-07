import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { QueueStatus } from '../enums';

export type QueueDocument = HydratedDocument<Queue>;

@Schema({ timestamps: true, collection: 'queues' })
export class Queue {
  /** Local hospital service date as YYYY-MM-DD */
  @Prop({ required: true, index: true })
  serviceDate!: string;

  @Prop({ required: true, default: 'ECHO' })
  unitCode!: string;

  @Prop({ type: String, enum: QueueStatus, default: QueueStatus.Open })
  status!: QueueStatus;

  @Prop({ type: Types.ObjectId, ref: 'QueueTicket', default: null })
  servingTicketId!: Types.ObjectId | null;

  @Prop({ type: Number, default: 0 })
  revision!: number;

  @Prop({ type: Number, default: 0 })
  nextTicketSeq!: number;
}

export const QueueSchema = SchemaFactory.createForClass(Queue);
QueueSchema.index({ serviceDate: 1, unitCode: 1 }, { unique: true });
