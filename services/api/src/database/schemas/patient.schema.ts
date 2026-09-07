import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PatientStatus } from '../enums';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true, collection: 'patients' })
export class Patient {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  nic!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  phoneE164!: string;

  @Prop({ type: Date, default: null })
  phoneVerifiedAt!: Date | null;

  @Prop({ type: Date, required: true })
  dateOfBirth!: Date;

  @Prop({ trim: true, default: '' })
  address!: string;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: String, enum: PatientStatus, default: PatientStatus.PendingVerification })
  status!: PatientStatus;

  @Prop({ type: Number, default: () => new Date().getFullYear() })
  memberSinceYear!: number;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ createdAt: -1 });
