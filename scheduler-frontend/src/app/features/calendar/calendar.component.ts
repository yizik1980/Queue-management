import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AppointmentDay } from '../../core/models/appointment.model';
import { HebrewDateService } from '../../core/services/hebrew-date.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { ClientsService } from '../../core/services/clients.service';
import { LocalClientService } from '../../core/services/local-client.service';
import { SettingsService } from '../../core/services/settings.service';
import {
  currentDateSignal, selectedDateSignal, appointmentsByDate,
  currentMonthAppointments, navigateMonth, showFormSignal,
  selectedAppointmentSignal, loadingSignal, localClientSignal,
} from '../../core/store/app.store';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { ClientRegistrationComponent } from '../client-registration/client-registration.component';

const HEBREW_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
const GREGORIAN_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, AppointmentFormComponent, ClientRegistrationComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private hebrewSvc      = inject(HebrewDateService);
  private appointmentsSvc = inject(AppointmentsService);
  private clientsSvc     = inject(ClientsService);
  private localClientSvc = inject(LocalClientService);
  private settingsSvc    = inject(SettingsService);
  readonly themeSvc      = inject(ThemeService);

  readonly loading       = loadingSignal;
  readonly showForm      = showFormSignal;
  readonly selectedDate  = selectedDateSignal;
  readonly localClient   = localClientSignal;
  readonly monthApps     = currentMonthAppointments;
  readonly weekDays      = HEBREW_DAYS;

  showRegistration = signal(false);

  readonly gridRows = computed(() => {
    const n = Math.ceil(this.calendarDays().length / 7);
    return `repeat(${n}, minmax(0, 1fr))`;
  });

  readonly monthTitle = computed(() => {
    const d = currentDateSignal();
    return `${GREGORIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly hebrewMonthTitle = computed(() =>
    this.hebrewSvc.getHebrewMonthTitle(currentDateSignal())
  );

  readonly calendarDays = computed<AppointmentDay[]>(() => {
    const d = currentDateSignal();
    const byDate = appointmentsByDate();
    const todayStr = this.toDateStr(new Date());

    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
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
    this.appointmentsSvc.loadAll().subscribe();
    this.clientsSvc.loadAll().subscribe();
    this.settingsSvc.load().subscribe();
    this.checkLocalClient();
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
