import {
  Controller, Get, Post, Patch, Delete, Body, Param,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('api/:adminId/clients')
export class ClientsController {
  constructor(private readonly svc: ClientsService) {}

  @Get()
  findAll(@Param('adminId') adminId: string) {
    return this.svc.findAll(adminId);
  }

  @Post()
  create(@Param('adminId') adminId: string, @Body() dto: CreateClientDto) {
    return this.svc.create({ ...dto, adminId });
  }

  @Patch(':id')
  update(
    @Param('adminId') adminId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>,
  ) {
    return this.svc.update(id, dto, adminId);
  }

  @Delete(':id')
  remove(@Param('adminId') adminId: string, @Param('id') id: string) {
    return this.svc.remove(id, adminId);
  }
}
