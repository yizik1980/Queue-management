import { signal, computed } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { Client } from '../models/client.model';
import { BusinessSettings } from '../models/settings.model';

// ── Admin identity (set from URL route on first load) ─────────────────────
export const adminIdSignal = signal<string>(localStorage.getItem('adminId') ?? '');

export function setAdminId(id: string): void {
  localStorage.setItem('adminId', id);
  adminIdSignal.set(id);
}

// ── Settings ────────────────────────────────────────────────────────────────
export const settingsSignal = signal<BusinessSettings | null>(null);

// ── Local (IndexedDB) client ────────────────────────────────────────────
export const localClientSignal = signal<Client | null>(null);

// ── State Signals ──────────────────────────────────────────────────────────
export const appointmentsSignal = signal<Appointment[]>([]);
export const clientsSignal = signal<Client[]>([]);
export const currentDateSignal = signal<Date>(new Date());
export const selectedDateSignal = signal<string | null>(null);
export const selectedAppointmentSignal = signal<Appointment | null>(null);
export const showFormSignal = signal<boolean>(false);
export const loadingSignal = signal<boolean>(false);

// ── Computed Signals ───────────────────────────────────────────────────────
export const currentMonthAppointments = computed(() => {
  const date = currentDateSignal();
  return appointmentsSignal().filter(a => {
    const [y, m] = a.date.split('-').map(Number);
    return y === date.getFullYear() && m === date.getMonth() + 1;
  });
});

export const appointmentsByDate = computed(() => {
  const map = new Map<string, Appointment[]>();
  for (const a of currentMonthAppointments()) {
    const list = map.get(a.date) ?? [];
    list.push(a);
    map.set(a.date, list);
  }
  return map;
});

export const selectedDayAppointments = computed(() => {
  const date = selectedDateSignal();
  if (!date) return [];
  return appointmentsSignal().filter(a => a.date === date);
});

// Active (pending/confirmed) future appointments for the locally-registered client
export const localClientActiveAppointments = computed(() => {
  const client = localClientSignal();
  if (!client?._id) return [];
  const now = new Date();
  return appointmentsSignal().filter(a => {
    if (a.clientId !== client._id) return false;
    if (a.status === 'cancelled' || a.status === 'completed') return false;
    const [h, m] = a.startTime.split(':').map(Number);
    const aptTime = new Date(a.date);
    aptTime.setHours(h, m, 0, 0);
    return aptTime > now;
  });
});

// ── Actions ────────────────────────────────────────────────────────────────
export function addAppointment(a: Appointment): void {
  appointmentsSignal.update(list => [...list, a]);
}

export function updateAppointment(updated: Appointment): void {
  appointmentsSignal.update(list =>
    list.map(a => (a._id === updated._id ? updated : a))
  );
}

export function removeAppointment(id: string): void {
  appointmentsSignal.update(list => list.filter(a => a._id !== id));
}

export function addClient(c: Client): void {
  clientsSignal.update(list => [...list, c]);
}

export function updateClient(updated: Client): void {
  clientsSignal.update(list =>
    list.map(c => (c._id === updated._id ? updated : c))
  );
}

export function removeClient(id: string): void {
  clientsSignal.update(list => list.filter(c => c._id !== id));
}

export function navigateMonth(direction: 1 | -1): void {
  currentDateSignal.update(d => {
    const next = new Date(d);
    next.setMonth(next.getMonth() + direction);
    return next;
  });
}
