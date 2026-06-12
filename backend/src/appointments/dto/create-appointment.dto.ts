export class CreateAppointmentDto {
  adminId: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  notes?: string;
  status?: string;
  color?: string;
}
