import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PresenceMode } from '../enums';

export type CheckInChallengeDocument = HydratedDocument<CheckInChallenge>;

@Schema({ timestamps: true, collection: 'check_in_challenges' })
export class CheckInChallenge {
  @Prop({ type: Types.ObjectId, ref: 'QueueTicket', required: true, index: true })
  ticketId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  /** Opaque public code embedded in QR (not the hash). Short-lived. */
  @Prop({ required: true })
  publicToken!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  consumedAt!: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'StaffMember', default: null })
  verifiedByStaffId!: Types.ObjectId | null;

  @Prop({ type: String, enum: PresenceMode, default: PresenceMode.Demo })
  presenceMode!: PresenceMode;
}

export const CheckInChallengeSchema = SchemaFactory.createForClass(CheckInChallenge);
