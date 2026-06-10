import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('api/appointments')
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    return date ? this.svc.findByDate(date) : this.svc.findAll();
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateAppointmentDto>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
