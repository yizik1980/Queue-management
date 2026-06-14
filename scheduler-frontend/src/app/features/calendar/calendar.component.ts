import { Component, OnInit, inject, computed, signal } from '@angular/core';
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
import { AdminCheckService } from '../../core/services/admin-check.service';

interface TodaySlot {
  time: string;
  appointment: Appointment | null;
  isPast: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, AppointmentFormComponent, ClientRegistrationComponent, NotFoundComponent],
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

  readonly loading = loadingSignal;
  readonly showForm = showFormSignal;
  readonly selectedDate = selectedDateSignal;
  readonly localClient = localClientSignal;
  readonly monthApps = currentMonthAppointments;

  showRegistration = signal(false);
  adminNotFound   = signal(false);
  checkedAdminId  = signal('');

  readonly weekDays = computed(() => this.langSvc.tr().weekDays);

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
        this.settingsSvc.load().subscribe();
        this.checkLocalClient();
      });
    });
  }

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
    selectedDateSignal.set(this.todayStr());
    selectedAppointmentSignal.set(null);
    showFormSignal.set(true);
  }

  openNewAppointment(): void {
    selectedAppointmentSignal.set(null);
    showFormSignal.set(true);
  }

  editAppointment(a: any, event: Event): void {
    event.stopPropagation();
    selectedAppointmentSignal.set(a);
    showFormSignal.set(true);
  }

  onRegistered(): void {
    this.showRegistration.set(false);
  }

  closeForm(): void { showFormSignal.set(false); }

  statusClass(status: string): string { return `status-badge status-${status}`; }
}
