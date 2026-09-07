import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AlertSeverity } from '../enums';

export type SystemAlertDocument = HydratedDocument<SystemAlert>;

@Schema({ timestamps: true, collection: 'system_alerts' })
export class SystemAlert {
  @Prop({ type: String, enum: AlertSeverity, required: true, index: true })
  severity!: AlertSeverity;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ type: Types.ObjectId, ref: 'EchoRoom', default: null })
  roomId!: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt!: Date | null;
}

export const SystemAlertSchema = SchemaFactory.createForClass(SystemAlert);
SystemAlertSchema.index({ createdAt: -1, severity: 1 });
