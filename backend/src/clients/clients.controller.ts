import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthService } from '../auth/auth.service';

@Controller('api/clients')
export class ClientsController {
  constructor(
    private readonly svc: ClientsService,
    private readonly authSvc: AuthService,
  ) {}

  private async resolveAdminId(username: string): Promise<string> {
    if (!username) throw new BadRequestException('Query param ?admin= is required');
    const admin = await this.authSvc.findByUsername(username);
    if (!admin) throw new NotFoundException(`Admin '${username}' not found`);
    return (admin._id as any).toString();
  }

  @Get()
  async findAll(@Query('admin') admin: string) {
    const adminId = await this.resolveAdminId(admin);
    return this.svc.findAll(adminId);
  }

  @Post()
  async create(@Query('admin') admin: string, @Body() dto: CreateClientDto) {
    const adminId = await this.resolveAdminId(admin);
    return this.svc.create({ ...dto, adminId });
  }

  @Patch(':id')
  async update(
    @Query('admin') admin: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>,
  ) {
    const adminId = await this.resolveAdminId(admin);
    return this.svc.update(id, dto, adminId);
  }

  @Delete(':id')
  async remove(@Query('admin') admin: string, @Param('id') id: string) {
    const adminId = await this.resolveAdminId(admin);
    return this.svc.remove(id, adminId);
  }
}
