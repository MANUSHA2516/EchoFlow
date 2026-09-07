import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PredictionScope } from '../enums';

export type PredictionDocument = HydratedDocument<Prediction>;

@Schema({ timestamps: true, collection: 'predictions' })
export class Prediction {
  @Prop({ type: String, enum: PredictionScope, required: true, index: true })
  scope!: PredictionScope;

  @Prop({ type: Types.ObjectId, ref: 'QueueTicket', default: null })
  ticketId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Queue', default: null })
  queueId!: Types.ObjectId | null;

  @Prop({ type: Number, default: null })
  hour!: number | null;

  @Prop({ type: Number, required: true })
  value!: number;

  @Prop({ required: true })
  modelVersion!: string;

  @Prop({ type: Number, default: null })
  confidence!: number | null;

  @Prop({ type: Object, default: null })
  featureImportance!: Record<string, number> | null;

  @Prop({ type: String, enum: ['synthetic', 'operational'], default: 'synthetic' })
  dataProvenance!: 'synthetic' | 'operational';
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
PredictionSchema.index({ scope: 1, createdAt: -1 });
