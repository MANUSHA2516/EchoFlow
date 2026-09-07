import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemSettingsDocument = HydratedDocument<SystemSettings>;

@Schema({ timestamps: true, collection: 'system_settings' })
export class SystemSettings {
  @Prop({ required: true, unique: true, default: 'default' })
  key!: string;

  @Prop({
    type: Object,
    default: {
      technician: {
        viewOwnRoomQueue: true,
        editPatientRecords: true,
        addRemoveStaff: false,
        manageOtherEchoRooms: false,
        viewAuditLog: false,
        changeAiSystemSettings: false,
      },
      room_lead: {
        viewOwnRoomQueue: true,
        editPatientRecords: true,
        addRemoveStaff: true,
        manageOtherEchoRooms: false,
        viewAuditLog: false,
        changeAiSystemSettings: false,
      },
      super_admin: {
        viewOwnRoomQueue: true,
        editPatientRecords: true,
        addRemoveStaff: true,
        manageOtherEchoRooms: true,
        viewAuditLog: true,
        changeAiSystemSettings: true,
      },
    },
  })
  permissions!: Record<string, Record<string, boolean>>;

  @Prop({
    type: Object,
    default: {
      requireTwoFactor: true,
      autoLockIdleMinutes: 15,
      passwordResetExpiryMinutes: 15,
    },
  })
  securityPolicy!: {
    requireTwoFactor: boolean;
    autoLockIdleMinutes: number;
    passwordResetExpiryMinutes: number;
  };

  @Prop({
    type: Object,
    default: {
      enableAiQueuePrediction: true,
      autoRetrainWeekly: true,
      showPredictedWaitToPatients: true,
      modelVersion: 'ECHO-ML-dev-0.1.0',
      lastTrainedAt: null,
    },
  })
  aiEngine!: {
    enableAiQueuePrediction: boolean;
    autoRetrainWeekly: boolean;
    showPredictedWaitToPatients: boolean;
    modelVersion: string;
    lastTrainedAt: Date | null;
  };
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);
