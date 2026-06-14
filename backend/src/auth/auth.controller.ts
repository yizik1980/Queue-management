import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.authService.validateAdmin(body.username, body.password);
    if (!admin) throw new UnauthorizedException('שם משתמש או סיסמה שגויים');
    return this.authService.login(admin);
  }
}
