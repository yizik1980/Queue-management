import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true, collection: 'clients' })
export class Client {
  @Prop({ required: true, index: true }) adminId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) phone: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) notes: string;
  @Prop({ default: '#6c5ce7' }) color: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
