export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  _id: string;
  clientId: string;
  clientName: string;
  date: string;        // YYYY-MM-DD
  startTime: string;
  endTime: string;
  service: string;
  notes?: string;
  status: AppointmentStatus;
  color: string;
  createdAt?: string;
}

export interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  color: string;
  createdAt?: string;
}

export interface BusinessSettings {
  workingDays: number[];   // 0=Sun … 6=Sat
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakStart: string;
  breakEnd: string;
  businessName?: string;
  bio?: string;
  popupMessage?: string;
}

export interface AdminStats {
  total:     number;
  pending:   number;
  confirmed: number;
  cancelled: number;
  completed: number;
  today:     number;
  clients:   number;
}
