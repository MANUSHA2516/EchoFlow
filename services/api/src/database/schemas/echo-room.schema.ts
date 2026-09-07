import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RoomStatus, RoomType } from '../enums';

export type EchoRoomDocument = HydratedDocument<EchoRoom>;

@Schema({ timestamps: true, collection: 'echo_rooms' })
export class EchoRoom {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ type: String, enum: RoomType, required: true })
  type!: RoomType;

  @Prop({ trim: true, default: '' })
  location!: string;

  @Prop({ trim: true, default: '08:00' })
  operatingHoursStart!: string;

  @Prop({ trim: true, default: '16:00' })
  operatingHoursEnd!: string;

  @Prop({ type: Types.ObjectId, ref: 'StaffMember', default: null })
  leadTechnicianId!: Types.ObjectId | null;

  @Prop({ type: String, enum: RoomStatus, default: RoomStatus.Offline, index: true })
  status!: RoomStatus;

  @Prop({ type: Number, default: 8, min: 1 })
  capacity!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  technicianCount!: number;

  @Prop({ type: Boolean, default: false })
  isLive!: boolean;
}

export const EchoRoomSchema = SchemaFactory.createForClass(EchoRoom);
EchoRoomSchema.index({ type: 1, status: 1 });
