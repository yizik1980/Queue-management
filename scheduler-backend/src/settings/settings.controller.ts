import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

/** Public read-only — Angular client needs this to show available slots */
@Controller('api/settings')
export class SettingsController {
  constructor(private svc: SettingsService) {}

  @Get()
  get() {
    return this.svc.getOrCreate();
  }
}
