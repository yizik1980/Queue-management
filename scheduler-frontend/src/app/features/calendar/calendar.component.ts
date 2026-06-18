import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { AppointmentDay, Appointment } from '../../core/models/appointment.model';
import { generateAllTimeSlots } from '../../core/models/settings.model';
import { HebrewDateService } from '../../core/services/hebrew-date.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { LocalClientService } from '../../core/services/local-client.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  currentDateSignal, selectedDateSignal, appointmentsByDate,
  currentMonthAppointments, navigateMonth, showFormSignal,
  selectedAppointmentSignal, loadingSignal, localClientSignal,
  settingsSignal, appointmentsSignal, setAdminId,
} from '../../core/store/app.store';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { ClientRegistrationComponent } from '../client-registration/client-registration.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { PopupMessageComponent } from '../popup-message/popup-message.component';
import { AdminCheckService } from '../../core/services/admin-check.service';
import { ToastComponent } from "../toast/toast.component";
import { ToastService } from "../../core/services/toast.service";
import { LoaderComponent } from "../loader/loader.component";
import { MiniCalendarComponent, MiniCalendarDay } from "../mini-calendar/mini-calendar.component";

interface TodaySlot {
  time: string;
  appointment: Appointment | null;
  isPast: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, AppointmentFormComponent, ClientRegistrationComponent, NotFoundComponent, PopupMessageComponent, ToastComponent, LoaderComponent, MiniCalendarComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private hebrewSvc = inject(HebrewDateService);
  private appointmentsSvc = inject(AppointmentsService);
  private localClientSvc = inject(LocalClientService);
  private settingsSvc = inject(SettingsService);
  private adminCheckSvc = inject(AdminCheckService);
  readonly themeSvc = inject(ThemeService);
  readonly langSvc = inject(LanguageService);
  readonly activeRoute = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly loading = loadingSignal;
  readonly showForm = showFormSignal;
  readonly selectedDate = selectedDateSignal;
  readonly localClient = localClientSignal;
  readonly monthApps = currentMonthAppointments;
  readonly settings = settingsSignal;

  showRegistration = signal(false);
  showOnboarding = signal(false);
  adminNotFound = signal(false);
  checkedAdminId = signal('');
  showPopup = signal(false);
  showInstructions = signal(false);
  showMobilePicker = signal(false);
  mobileDate       = signal(new Date());

  readonly weekDays = computed(() => this.langSvc.tr().weekDays);

  readonly mobileDateStr = computed(() => this.toDateStr(this.mobileDate()));

  readonly isMobileDateToday = computed(() => this.mobileDateStr() === this.todayStr());

  readonly mobileDateGregorianLabel = computed(() => {
    const d = this.mobileDate();
    const t = this.langSvc.tr();
    return t.formatTodayLabel(t.dayNames[d.getDay()], d.getDate(), t.months[d.getMonth()]);
  });

  readonly mobileDateHebrewFull = computed(() =>
    this.hebrewSvc.toHebrewDate(this.mobileDate()).fullLabel
  );

  readonly mobileSlotList = computed<TodaySlot[]>(() => {
    const s = settingsSignal();
    if (!s) return [];
    const dateStr = this.mobileDateStr();
    const nowMin = this.isMobileDateToday()
      ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
    const aptMap = new Map<string, Appointment>();
    for (const a of appointmentsSignal().filter(a => a.date === dateStr)) {
      aptMap.set(a.startTime, a);
    }
    return generateAllTimeSlots(s).map(time => {
      const [h, m] = time.split(':').map(Number);
      return { time, appointment: aptMap.get(time) ?? null, isPast: h * 60 + m < nowMin };
    });
  });

  readonly todayStr = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  readonly todayGregorianLabel = computed(() => {
    const now = new Date();
    const t = this.langSvc.tr();
    return t.formatTodayLabel(t.dayNames[now.getDay()], now.getDate(), t.months[now.getMonth()]);
  });

  readonly todayHebrewFull = computed(() =>
    this.hebrewSvc.toHebrewDate(new Date()).fullLabel
  );

  readonly todaySlotList = computed<TodaySlot[]>(() => {
    const s = settingsSignal();
    if (!s) return [];
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const aptMap = new Map<string, Appointment>();
    for (const a of appointmentsSignal().filter(a => a.date === this.todayStr())) {
      aptMap.set(a.startTime, a);
    }
    return generateAllTimeSlots(s).map(time => {
      const [h, m] = time.split(':').map(Number);
      return { time, appointment: aptMap.get(time) ?? null, isPast: h * 60 + m < nowMin };
    });
  });

  readonly gridRows = computed(() => {
    const n = Math.ceil(this.calendarDays().length / 7);
    return `repeat(${n}, minmax(0, 1fr))`;
  });

  readonly monthTitle = computed(() => {
    const d = currentDateSignal();
    return `${this.langSvc.tr().months[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly hebrewMonthTitle = computed(() =>
    this.hebrewSvc.getHebrewMonthTitle(currentDateSignal())
  );

  readonly calendarDays = computed<AppointmentDay[]>(() => {
    const d = currentDateSignal();
    const byDate = appointmentsByDate();
    const todayStr = this.toDateStr(new Date());

    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const startDow = firstDay.getDay();
    const days: AppointmentDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      days.push(this.buildDay(date, byDate, todayStr, false));
    }

    for (let n = 1; n <= lastDay.getDate(); n++) {
      days.push(this.buildDay(new Date(d.getFullYear(), d.getMonth(), n), byDate, todayStr, true));
    }

    const rem = days.length % 7;
    if (rem !== 0) {
      for (let i = 1; i <= 7 - rem; i++) {
        const date = new Date(lastDay);
        date.setDate(date.getDate() + i);
        days.push(this.buildDay(date, byDate, todayStr, false));
      }
    }

    return days;
  });

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe(params => {
      const adminId = params.get('adminId');
      if (!adminId) return;
      this.checkedAdminId.set(adminId);
      this.adminCheckSvc.exists(adminId).subscribe(exists => {
        if (!exists) { this.adminNotFound.set(true); return; }
        setAdminId(adminId);
        this.appointmentsSvc.loadAll().subscribe();
        this.settingsSvc.load().subscribe((settings) => {
          if (!settings) return;
          this.showPopup.set(true)
        });
        this.langSvc.tr().tips?.map(tip =>
          this.toastService.show(tip.text, 'success', 10000, tip.icon));
        this.checkLocalClient();
      });
    });
  }

  closePopup(): void { this.showPopup.set(false); }

  private async checkLocalClient(): Promise<void> {
    const client = await this.localClientSvc.loadOrNull();
    if (!client) this.showRegistration.set(true);
  }

  private buildDay(
    date: Date,
    byDate: Map<string, any[]>,
    todayStr: string,
    isCurrentMonth: boolean,
  ): AppointmentDay {
    const dateStr = this.toDateStr(date);
    const heb = this.hebrewSvc.toHebrewDate(date);
    return {
      date, dateStr,
      appointments: byDate.get(dateStr) ?? [],
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      isCurrentMonth,
      gregorianLabel: String(date.getDate()),
      hebrewLabel: heb.dayLabel,
      hebrewFull: heb.fullLabel,
    };
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  prevMonth(): void { navigateMonth(-1); }
  nextMonth(): void { navigateMonth(1); }

  selectDay(day: AppointmentDay): void {
    if (!day.isCurrentMonth || day.isPast) return;
    selectedDateSignal.set(day.dateStr);
    selectedAppointmentSignal.set(null);
    showFormSignal.set(true);
  }

  selectSlotMobile(_time: string): void {
    selectedDateSignal.set(this.mobileDateStr());
    selectedAppointmentSignal.set(null);
    showFormSignal.set(true);
  }

  selectMobileDay(day: MiniCalendarDay): void {
    if (!day.isCurrentMonth || day.isPast) return;
    this.mobileDate.set(day.date);
    this.showMobilePicker.set(false);
  }


  openNewAppointment(): void {
    selectedAppointmentSignal.set(null);
    showFormSignal.set(true);
  }

  editAppointment(a: any, event: Event): void {
    event.stopPropagation();
    const lc = localClientSignal();
    if (lc && a.clientId !== lc._id) return;
    selectedAppointmentSignal.set(a);
    showFormSignal.set(true);
  }

  onRegistered(): void {
    this.showRegistration.set(false);
    this.showOnboarding.set(true);
  }

  closeForm(): void { showFormSignal.set(false); }

  statusClass(status: string): string { return `status-badge status-${status}`; }

  statusLabel(status: string): string {
    const t = this.langSvc.tr();
    const map: Record<string, string> = {
      pending: t.statusPending, confirmed: t.statusConfirmed,
      cancelled: t.statusCancelled, completed: t.statusCompleted,
    };
    return map[status] ?? status;
  }

  formatAptDate(dateStr: string): string {
    const t = this.langSvc.tr();
    if (dateStr === this.todayStr()) return t.todayWord;
    const [, m, d] = dateStr.split('-').map(Number);
    return t.dir === 'rtl' ? `${d} ב${t.months[m - 1]}` : `${t.months[m - 1]} ${d}`;
  }

  readonly myAppointments = computed(() => {
    const lc = localClientSignal();
    if (!lc) return [];
    return appointmentsSignal().filter(a =>
      a.clientId === lc._id && a.status !== 'cancelled' && a.status !== 'completed'
    );
  });

  downloadIcs(): void {
    const apts = this.myAppointments();
    if (!apts.length) return;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scheduler//HE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const a of apts) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${a._id ?? a.date + a.startTime}@scheduler`,
        `DTSTART:${this.toIcsDt(a.date, a.startTime)}`,
        `DTEND:${this.toIcsDt(a.date, a.endTime)}`,
        `SUMMARY:${this.icsEscape(a.service)}`,
        ...(a.notes ? [`DESCRIPTION:${this.icsEscape(a.notes)}`] : []),
        `STATUS:${a.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT',
      );
    }
    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = 'תורים.ics';
    el.click();
    URL.revokeObjectURL(url);
  }

  private toIcsDt(date: string, time: string): string {
    return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  }

  private icsEscape(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }
}
