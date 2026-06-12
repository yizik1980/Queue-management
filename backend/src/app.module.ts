import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { SettingsModule } from './settings/settings.module';
import { MigrationService } from './migration.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
  providers: [MigrationService],
})
export class AppModule {}
