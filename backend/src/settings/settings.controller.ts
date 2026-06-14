import { Controller, Get, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

/** Public read-only — Angular client needs this to show available slots */
@Controller('api/:adminId/settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get()
  get(@Param('adminId') adminId: string) {
    return this.svc.getOrCreate(adminId);
  }
}
