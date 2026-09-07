import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { VisitReason, VisitStatus } from '../enums';

export type VisitDocument = HydratedDocument<Visit>;

@Schema({ timestamps: true, collection: 'visits' })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QueueTicket', default: null })
  ticketId!: Types.ObjectId | null;

  @Prop({ required: true, index: true })
  serviceDate!: string;

  @Prop({ type: String, enum: VisitReason, required: true })
  visitType!: VisitReason;

  @Prop({ trim: true, default: '' })
  doctorName!: string;

  @Prop({ type: Types.ObjectId, ref: 'StaffMember', default: null })
  staffId!: Types.ObjectId | null;

  @Prop({ trim: true, default: '' })
  summary!: string;

  @Prop({ trim: true, default: '' })
  clinicalNote!: string;

  @Prop({ type: String, enum: VisitStatus, default: VisitStatus.Completed, index: true })
  status!: VisitStatus;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ patientId: 1, serviceDate: -1 });
