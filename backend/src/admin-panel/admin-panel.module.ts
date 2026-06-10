import { Module } from '@nestjs/common';
import { AdminPanelController } from './admin-panel.controller';
import { AuthModule } from '../auth/auth.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { ClientsModule } from '../clients/clients.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [AuthModule, AppointmentsModule, ClientsModule, SettingsModule],
  controllers: [AdminPanelController],
})
export class AdminPanelModule {}
