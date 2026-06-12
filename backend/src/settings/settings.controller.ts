import { Controller, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthService } from '../auth/auth.service';

/** Public read-only — Angular client needs this to show available slots */
@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly svc: SettingsService,
    private readonly authSvc: AuthService,
  ) {}

  private async resolveAdminId(username: string): Promise<string> {
    if (!username) throw new BadRequestException('Query param ?admin= is required');
    const admin = await this.authSvc.findByUsername(username);
    if (!admin) throw new NotFoundException(`Admin '${username}' not found`);
    return (admin._id as any).toString();
  }

  @Get()
  async get(@Query('admin') admin: string) {
    const adminId = await this.resolveAdminId(admin);
    return this.svc.getOrCreate(adminId);
  }
}
