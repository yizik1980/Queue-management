import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ({ uri: config.get<string>('MONGO_URI') }),
    }),
    AppointmentsModule,
    ClientsModule,
    AuthModule,
    SettingsModule,
    AdminPanelModule,
  ],
})
export class AppModule {}
