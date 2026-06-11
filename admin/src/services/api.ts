import axios from 'axios';
import { tokenSignal, setToken } from '../signals/store';
import type { Appointment, Client, AdminStats, BusinessSettings } from '../types';

const _apiRoot = import.meta.env.VITE_API_URL as string | undefined;
const BASE = _apiRoot ? `${_apiRoot}/api` : 'http://localhost:3000/api';

const http = axios.create({ baseURL: BASE });

http.interceptors.request.use(cfg => {
  const token = tokenSignal.value;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) setToken(null);
    return Promise.reject(err);
  },
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    http.post<{ access_token: string }>('/auth/login', { username, password })
      .then(r => r.data),
};

// ── Admin: appointments ───────────────────────────────────────────────────────
export const appointmentsApi = {
  getAll:  () =>
    http.get<Appointment[]>('/admin/appointments').then(r => r.data),
  update:  (id: string, dto: Partial<Appointment>) =>
    http.patch<Appointment>(`/admin/appointments/${id}`, dto).then(r => r.data),
  remove:  (id: string) =>
    http.delete(`/admin/appointments/${id}`).then(r => r.data),
};

// ── Admin: clients ────────────────────────────────────────────────────────────
export const clientsApi = {
  getAll:  () =>
    http.get<Client[]>('/admin/clients').then(r => r.data),
  update:  (id: string, dto: Partial<Client>) =>
    http.patch<Client>(`/admin/clients/${id}`, dto).then(r => r.data),
  remove:  (id: string) =>
    http.delete(`/admin/clients/${id}`).then(r => r.data),
};

// ── Admin: stats ──────────────────────────────────────────────────────────────
export const statsApi = {
  get: () =>
    http.get<AdminStats>('/admin/stats').then(r => r.data),
};

// ── Admin: settings ───────────────────────────────────────────────────────────
export const settingsApi = {
  get:    () =>
    http.get<BusinessSettings>('/admin/settings').then(r => r.data),
  update: (dto: Partial<BusinessSettings>) =>
    http.patch<BusinessSettings>('/admin/settings', dto).then(r => r.data),
};
