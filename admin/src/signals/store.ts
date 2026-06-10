import { signal, computed } from '@preact/signals-react';
import type { Appointment, Client, AdminStats } from '../types';

// ── Auth ─────────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'scheduler_admin_token';

export const tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

export const isAuthenticated = computed(() => !!tokenSignal.value);

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  tokenSignal.value = token;
}

export function logout(): void {
  setToken(null);
}

// ── Data ─────────────────────────────────────────────────────────────────────
export const appointmentsSignal = signal<Appointment[]>([]);
export const clientsSignal      = signal<Client[]>([]);
export const statsSignal        = signal<AdminStats | null>(null);
export const loadingSignal      = signal(false);
export const errorSignal        = signal<string | null>(null);

// ── Filters ──────────────────────────────────────────────────────────────────
export const filterDateSignal   = signal('');
export const filterStatusSignal = signal('');

export const filteredAppointments = computed(() => {
  let list = appointmentsSignal.value;
  const date   = filterDateSignal.value;
  const status = filterStatusSignal.value;
  if (date)   list = list.filter(a => a.date === date);
  if (status) list = list.filter(a => a.status === status);
  return list;
});

// ── Derived ──────────────────────────────────────────────────────────────────
export const appointmentCountByClient = computed(() => {
  const map = new Map<string, number>();
  for (const a of appointmentsSignal.value) {
    if (a.status === 'cancelled' || a.status === 'completed') continue;
    map.set(a.clientId, (map.get(a.clientId) ?? 0) + 1);
  }
  return map;
});
