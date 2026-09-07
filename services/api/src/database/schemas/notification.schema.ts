import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from '../enums';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type!: NotificationType;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  body!: string;

  @Prop({ type: Types.ObjectId, ref: 'QueueTicket', default: null })
  ticketId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  readAt!: Date | null;

  @Prop({ required: true, unique: true })
  dedupeKey!: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ patientId: 1, createdAt: -1 });
