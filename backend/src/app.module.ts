import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,   // 1 minute window
        limit: 100,    // 100 requests per IP per minute
      },
    ]),
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
  controllers: [AppController],
  providers: [
    MigrationService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
