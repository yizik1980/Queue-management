import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { SettingsModule } from './settings/settings.module';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/scheduler';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI),
    AppointmentsModule,
    ClientsModule,
    AuthModule,
    SettingsModule,
    AdminPanelModule,
  ],
})
export class AppModule {}
