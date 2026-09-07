import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AuditCategory, SubjectType } from '../enums';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, default: null, index: true })
  actorId!: Types.ObjectId | null;

  @Prop({ type: String, enum: SubjectType, required: true })
  actorRole!: SubjectType;

  @Prop({ required: true, trim: true, index: true })
  action!: string;

  @Prop({ type: String, enum: AuditCategory, required: true, index: true })
  category!: AuditCategory;

  @Prop({ type: String, trim: true, default: null })
  targetType!: string | null;

  @Prop({ type: Types.ObjectId, default: null })
  targetId!: Types.ObjectId | null;

  /** Safe metadata only — never passwords, OTP codes, or tokens. */
  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ type: String, default: null })
  ip!: string | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
