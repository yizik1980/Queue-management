import {
  Controller, Get, Patch, Delete, Body, Param, UseGuards, Query, Req,
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
  ) { }

  // ── Appointments ──────────────────────────────────────────────────────

  @Get('appointments/:adminId')
  getAllAppointments(@Param('adminId') adminId: string) {
    console.log('AdminPanelController.getAllAppointments', { adminId });
    return this.appointmentsSvc.findAll(adminId);
  }

  @Patch('appointments/:id')
  updateAppointment(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.appointmentsSvc.update(id, body, req.user.sub);
  }

  @Delete('appointments/:id')
  deleteAppointment(@Req() req: any, @Param('id') id: string) {
    return this.appointmentsSvc.remove(id, req.user.sub);
  }

  // ── Clients ───────────────────────────────────────────────────────────

  @Get('clients')
  getAllClients(@Req() req: any) {
    return this.clientsSvc.findAll(req.user.sub);
  }

  @Patch('clients/:id')
  updateClient(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.clientsSvc.update(id, body, req.user.sub);
  }

  @Delete('clients/:id')
  deleteClient(@Req() req: any, @Param('id') id: string) {
    return this.clientsSvc.remove(id, req.user.sub);
  }

  // ── Settings ──────────────────────────────────────────────────────────

  @Get('settings')
  getSettings(@Req() req: any) {
    return this.settingsSvc.getOrCreate(req.user.sub);
  }

  @Patch('settings')
  updateSettings(@Req() req: any, @Body() body: any) {
    return this.settingsSvc.update(req.user.sub, body);
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  @Get('stats')
  async getStats(@Req() req: any) {
    const adminId: string = req.user.sub;
    const [appointments, clients] = await Promise.all([
      this.appointmentsSvc.findAll(adminId),
      this.clientsSvc.findAll(adminId),
    ]);

    const byStatus = (s: string) => appointments.filter((a: any) => a.status === s).length;
    const today = new Date().toISOString().slice(0, 10);

    return {
      total: appointments.length,
      pending: byStatus('pending'),
      confirmed: byStatus('confirmed'),
      cancelled: byStatus('cancelled'),
      completed: byStatus('completed'),
      today: appointments.filter((a: any) => a.date === today).length,
      clients: clients.length,
    };
  }
}
