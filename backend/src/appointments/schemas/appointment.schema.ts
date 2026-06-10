import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  @Prop({ required: true }) clientId: string;
  @Prop({ required: true }) clientName: string;
  @Prop({ required: true }) date: string;   // YYYY-MM-DD
  @Prop({ required: true }) startTime: string;
  @Prop({ required: true }) endTime: string;
  @Prop({ required: true }) service: string;
  @Prop({ default: '' }) notes: string;
  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  status: string;
  @Prop({ default: '#6c5ce7' }) color: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
