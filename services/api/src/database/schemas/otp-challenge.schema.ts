import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OtpPurpose } from '../enums';

export type OtpChallengeDocument = HydratedDocument<OtpChallenge>;

@Schema({ timestamps: true, collection: 'otp_challenges' })
export class OtpChallenge {
  @Prop({ type: String, enum: OtpPurpose, required: true, index: true })
  purpose!: OtpPurpose;

  @Prop({ type: String, trim: true, default: null })
  nic!: string | null;

  @Prop({ required: true, trim: true, index: true })
  phoneE164!: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', default: null })
  patientId!: Types.ObjectId | null;

  @Prop({ required: true })
  codeHash!: string;

  @Prop({ type: Date, required: true, index: true })
  expiresAt!: Date;

  @Prop({ type: Number, default: 0 })
  attempts!: number;

  @Prop({ type: Date, default: null })
  consumedAt!: Date | null;

  @Prop({ type: Date, default: null })
  lastSentAt!: Date | null;

  @Prop({ type: Object, default: {} })
  pendingPayload!: Record<string, unknown>;
}

export const OtpChallengeSchema = SchemaFactory.createForClass(OtpChallenge);
OtpChallengeSchema.index({ phoneE164: 1, purpose: 1, createdAt: -1 });
