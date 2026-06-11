export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  _id?: string;
  clientId: string;
  clientName: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  service: string;
  notes?: string;
  status: AppointmentStatus;
  color: string;
}

export interface AppointmentDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  appointments: Appointment[];
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  gregorianLabel: string;
  hebrewLabel: string;
  hebrewFull: string;
}
