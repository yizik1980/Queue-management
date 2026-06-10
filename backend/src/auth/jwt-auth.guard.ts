import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from './auth.constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      req.user = this.jwtService.verify(token, { secret: JWT_SECRET });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(req: any): string | null {
    const auth: string | undefined = req.headers['authorization'];
    const [type, token] = auth?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
