import { Injectable, inject, effect, DestroyRef } from '@angular/core';
import { Appointment } from '../models/appointment.model';
import { localClientActiveAppointments } from '../store/app.store';
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private langSvc = inject(LanguageService);
  private destroyRef = inject(DestroyRef);
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    effect(() => {
      const appts = localClientActiveAppointments();
      this.reschedule(appts);
    });
    this.destroyRef.onDestroy(() => this.clearAll());
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  }

  private reschedule(appointments: Appointment[]): void {
    this.clearAll();
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = Date.now();
    const reminders = [
      { offsetMs: 60 * 60 * 1000, labelHe: 'בעוד שעה', labelEn: 'In 1 hour' },
      { offsetMs: 30 * 60 * 1000, labelHe: 'בעוד חצי שעה', labelEn: 'In 30 minutes' },
      { offsetMs: 15 * 60 * 1000, labelHe: 'בעוד 15 דקות', labelEn: 'In 15 minutes' },
    ];

    for (const appt of appointments) {
      const apptMs = this.toMs(appt.date, appt.startTime);
      if (apptMs <= now) continue;

      for (const { offsetMs, labelHe, labelEn } of reminders) {
        const delay = apptMs - offsetMs - now;
        if (delay < 0) continue;

        const id = setTimeout(() => {
          const isHe = this.langSvc.lang() === 'he';
          const label = isHe ? labelHe : labelEn;
          const title = isHe ? `תזכורת תור — ${appt.service}` : `Appointment reminder — ${appt.service}`;
          const body = isHe
            ? `${label} (${appt.startTime})`
            : `${label} (${appt.startTime})`;
          this.fire(title, body);
        }, delay);

        this.timeouts.push(id);
      }
    }
  }

  private fire(title: string, body: string): void {
    if (Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '/favicon.ico', tag: title });
  }

  private clearAll(): void {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private toMs(dateStr: string, timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(dateStr);
    d.setHours(h, m, 0, 0);
    return d.getTime();
  }
}
