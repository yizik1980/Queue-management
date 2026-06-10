import {
  Controller, Get, Patch, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from '../appointments/appointments.service';
import { ClientsService } from '../clients/clients.service';
import { SettingsService } from '../settings/settings.service';

@UseGuards(JwtAuthGuard)
@Controller('api/admin')
export class AdminPanelController {
  constructor(
    private appointmentsSvc: AppointmentsService,
    private clientsSvc: ClientsService,
    private settingsSvc: SettingsService,
  ) {}

  // ── Appointments ──────────────────────────────────────────────────────

  @Get('appointments')
  getAllAppointments(@Query('date') date?: string) {
    return date ? this.appointmentsSvc.findByDate(date) : this.appointmentsSvc.findAll();
  }

  @Patch('appointments/:id')
  updateAppointment(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsSvc.update(id, body);
  }

  @Delete('appointments/:id')
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentsSvc.remove(id);
  }

  // ── Clients ───────────────────────────────────────────────────────────

  @Get('clients')
  getAllClients() {
    return this.clientsSvc.findAll();
  }

  @Patch('clients/:id')
  updateClient(@Param('id') id: string, @Body() body: any) {
    return this.clientsSvc.update(id, body);
  }

  @Delete('clients/:id')
  deleteClient(@Param('id') id: string) {
    return this.clientsSvc.remove(id);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  @Get('settings')
  getSettings() {
    return this.settingsSvc.getOrCreate();
  }

  @Patch('settings')
  updateSettings(@Body() body: any) {
    return this.settingsSvc.update(body);
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  @Get('stats')
  async getStats() {
    const [appointments, clients] = await Promise.all([
      this.appointmentsSvc.findAll(),
      this.clientsSvc.findAll(),
    ]);

    const byStatus = (s: string) => appointments.filter((a: any) => a.status === s).length;
    const today = new Date().toISOString().slice(0, 10);

    return {
      total:     appointments.length,
      pending:   byStatus('pending'),
      confirmed: byStatus('confirmed'),
      cancelled: byStatus('cancelled'),
      completed: byStatus('completed'),
      today:     appointments.filter((a: any) => a.date === today).length,
      clients:   clients.length,
    };
  }
}
