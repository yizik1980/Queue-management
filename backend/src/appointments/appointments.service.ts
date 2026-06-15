import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectModel(Appointment.name) private model: Model<AppointmentDocument>,
  ) {}

  findAll(adminId: string): Promise<AppointmentDocument[]> {
    return this.model.find({ adminId }).sort({ date: 1, startTime: 1 }).lean().exec() as any;
  }

  findByDate(date: string, adminId: string): Promise<AppointmentDocument[]> {
    return this.model.find({ adminId }).sort({ startTime: 1 }).lean().exec() as any;
  }

  async create(dto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const created = new this.model(dto);
    return created.save();
  }

  async update(id: string, dto: Partial<CreateAppointmentDto>, adminId: string): Promise<AppointmentDocument> {
    const doc = await this.model.findOneAndUpdate({ _id: id, adminId }, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Appointment ${id} not found`);
    return doc;
  }

  async remove(id: string, adminId: string): Promise<void> {
    const doc = await this.model.findOneAndDelete({ _id: id, adminId }).exec();
    if (!doc) throw new NotFoundException(`Appointment ${id} not found`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deletePastAppointments(): Promise<void> {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const { deletedCount } = await this.model.deleteMany({ date: { $lt: todayStr } }).exec();
    this.logger.log(`Daily cleanup: deleted ${deletedCount} past appointments`);
  }
}
