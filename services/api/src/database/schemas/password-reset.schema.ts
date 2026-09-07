import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PasswordResetDocument = HydratedDocument<PasswordReset>;

@Schema({ timestamps: true, collection: 'password_resets' })
export class PasswordReset {
  @Prop({ type: Types.ObjectId, ref: 'StaffMember', required: true, index: true })
  staffId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  consumedAt!: Date | null;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
