import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SubjectType } from '../enums';

export type RefreshSessionDocument = HydratedDocument<RefreshSession>;

@Schema({ timestamps: true, collection: 'refresh_sessions' })
export class RefreshSession {
  @Prop({ type: String, enum: SubjectType, required: true })
  subjectType!: SubjectType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  subjectId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt!: Date | null;

  @Prop({ type: String, default: null })
  userAgent!: string | null;
}

export const RefreshSessionSchema = SchemaFactory.createForClass(RefreshSession);
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
