import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthService } from './auth/auth.service';

@Controller('api')
export class AppController {
  constructor(private readonly authSvc: AuthService) {}

  @Get(':adminId/check')
  async checkAdmin(@Param('adminId') adminId: string) {
    if (!Types.ObjectId.isValid(adminId))
      throw new NotFoundException('Admin not found');
    const admin = await this.authSvc.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');
    return { exists: true };
  }
}
