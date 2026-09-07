import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { StaffAccountStatus, UserRole } from '../enums';

export type StaffMemberDocument = HydratedDocument<StaffMember>;

@Schema({ timestamps: true, collection: 'staff_members' })
export class StaffMember {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  staffId!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ trim: true, default: '' })
  phone!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: [UserRole.Technician, UserRole.RoomLead],
    default: UserRole.Technician,
  })
  role!: UserRole.Technician | UserRole.RoomLead;

  @Prop({ type: Types.ObjectId, ref: 'EchoRoom', default: null, index: true })
  assignedRoomId!: Types.ObjectId | null;

  @Prop({ type: String, enum: StaffAccountStatus, default: StaffAccountStatus.Pending, index: true })
  status!: StaffAccountStatus;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: Date, default: null })
  dateOfBirth!: Date | null;

  @Prop({ type: Date, default: null })
  lastActiveAt!: Date | null;

  @Prop({ type: Date, default: null })
  shiftStart!: Date | null;

  @Prop({ type: Date, default: null })
  shiftEnd!: Date | null;
}

export const StaffMemberSchema = SchemaFactory.createForClass(StaffMember);
