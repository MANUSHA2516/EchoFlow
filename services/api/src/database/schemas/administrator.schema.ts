import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enums';

export type AdministratorDocument = HydratedDocument<Administrator>;

@Schema({ timestamps: true, collection: 'administrators' })
export class Administrator {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  adminId!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ trim: true, default: '' })
  phone!: string;

  @Prop({ required: true })
  passwordHash!: string;

  /** Encrypted or base32 TOTP secret — never return in API responses. */
  @Prop({ type: String, default: null })
  totpSecret!: string | null;

  @Prop({ type: Boolean, default: true })
  totpEnabled!: boolean;

  @Prop({ type: String, enum: [UserRole.SuperAdmin], default: UserRole.SuperAdmin })
  role!: UserRole.SuperAdmin;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date | null;

  @Prop({ trim: true, default: 'ECHO Unit' })
  department!: string;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;
}

export const AdministratorSchema = SchemaFactory.createForClass(Administrator);
