import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ collection: 'settings', timestamps: true })
export class Settings {
  @Prop({ required: true, unique: true, index: true }) adminId: string;

  /** 0=Sun … 6=Sat  (default: Sun–Thu) */
  @Prop({ type: [Number], default: [0, 1, 2, 3, 4] })
  workingDays: number[];

  @Prop({ default: '09:00' }) startTime: string;
  @Prop({ default: '18:00' }) endTime: string;

  /** Appointment slot length in minutes */
  @Prop({ default: 30 }) slotDuration: number;

  @Prop({ default: '13:00' }) breakStart: string;
  @Prop({ default: '14:00' }) breakEnd: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
