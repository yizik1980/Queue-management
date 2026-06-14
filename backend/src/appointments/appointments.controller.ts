import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('api/:adminId/appointments')
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Get()
  findAll(@Param('adminId') adminId: string, @Query('date') date?: string) {
    return date ? this.svc.findByDate(date, adminId) : this.svc.findAll(adminId);
  }

  @Post()
  create(@Param('adminId') adminId: string, @Body() dto: CreateAppointmentDto) {
    return this.svc.create({ ...dto, adminId });
  }

  @Patch(':id')
  update(
    @Param('adminId') adminId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAppointmentDto>,
  ) {
    return this.svc.update(id, dto, adminId);
  }

  @Delete(':id')
  remove(@Param('adminId') adminId: string, @Param('id') id: string) {
    return this.svc.remove(id, adminId);
  }
}
