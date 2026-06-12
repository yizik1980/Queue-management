import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth/auth.service';
import { Appointment, AppointmentDocument } from './appointments/schemas/appointment.schema';
import { Client, ClientDocument } from './clients/schemas/client.schema';
import { Settings, SettingsDocument } from './settings/settings.schema';

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly authSvc: AuthService,
    @InjectModel(Appointment.name) private aptModel: Model<AppointmentDocument>,
    @InjectModel(Client.name)      private clientModel: Model<ClientDocument>,
    @InjectModel(Settings.name)    private settingsModel: Model<SettingsDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.authSvc.ensureDefaultAdmin();

    const admin = await this.authSvc.findByUsername('admin');
    if (!admin) return;

    const id = (admin._id as any).toString();
    const filter = { adminId: { $exists: false } };

    const [a, c, s] = await Promise.all([
      this.aptModel.updateMany(filter, { adminId: id }),
      this.clientModel.updateMany(filter, { adminId: id }),
      this.settingsModel.updateMany(filter, { adminId: id }),
    ]);

    if (a.modifiedCount || c.modifiedCount || s.modifiedCount) {
      this.logger.log(
        `Migration: ${a.modifiedCount} appointments, ${c.modifiedCount} clients, ${s.modifiedCount} settings → assigned to '${admin.username}'`,
      );
    }
  }
}
