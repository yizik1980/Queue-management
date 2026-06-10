import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin, AdminDocument } from './admin.schema';
import { JWT_SECRET, JWT_EXPIRES } from './auth.constants';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.adminModel.countDocuments();
    if (count === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.adminModel.create({ username: 'admin', passwordHash });
      this.logger.warn('Default admin created → username: admin  password: admin123 — change this in production!');
    }
  }

  async validateAdmin(username: string, password: string): Promise<AdminDocument | null> {
    const admin = await this.adminModel.findOne({ username }).exec();
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.passwordHash);
    return valid ? admin : null;
  }

  login(admin: AdminDocument): { access_token: string } {
    const payload = { sub: admin._id, username: admin.username };
    return {
      access_token: this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: JWT_EXPIRES }),
    };
  }
}
