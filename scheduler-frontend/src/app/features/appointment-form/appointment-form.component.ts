import { Component, OnInit, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { generateTimeSlots } from '../../core/models/settings.model';
import { AppointmentsService } from '../../core/services/appointments.service';
import { HebrewDateService } from '../../core/services/hebrew-date.service';
import {
  clientsSignal, selectedAppointmentSignal, selectedDateSignal,
  localClientSignal, localClientActiveAppointments, settingsSignal,
  appointmentsSignal,
} from '../../core/store/app.store';

const APPOINTMENT_COLORS = [
  '#e84393', '#6c5ce7', '#00b894', '#fdcb6e', '#0984e3',
  '#e17055', '#a29bfe', '#55efc4', '#fab1a0', '#74b9ff',
];

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
})
export class AppointmentFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private svc       = inject(AppointmentsService);
  private hebrewSvc = inject(HebrewDateService);

  readonly clients     = clientsSignal;
  readonly localClient = localClientSignal;
  readonly editing     = computed(() => !!selectedAppointmentSignal());
  readonly colors      = APPOINTMENT_COLORS;

  /** Minimum selectable date = today (YYYY-MM-DD) */
  readonly today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  /** True when client mode and already at the 2-appointment limit (new only) */
  readonly limitReached = computed(() => {
    if (!localClientSignal()) return false;
    if (selectedAppointmentSignal()) return false;
    return localClientActiveAppointments().length >= 2;
  });

  /** Is the selected date a working day? */
  readonly isWorkingDay = computed(() => {
    const s = settingsSignal();
    const date = this.formDate();
    if (!s || !date) return true;
    const dow = new Date(date + 'T12:00:00').getDay();
    return s.workingDays.includes(dow);
  });

  /** Closed day label */
  readonly closedDayName = computed(() => {
    const date = this.formDate();
    if (!date) return '';
    return DAY_NAMES[new Date(date + 'T12:00:00').getDay()];
  });

  /** All time slots for the selected date (past slots excluded when today) */
  readonly allSlots = computed(() => {
    const s = settingsSignal();
    const date = this.formDate();
    if (!s || !date || !this.isWorkingDay()) return [];
    return generateTimeSlots(s, date);
  });

  /** Set of already-booked start times for the selected date (excludes current editing apt) */
  readonly bookedSlots = computed(() => {
    const date = this.formDate();
    const editingId = selectedAppointmentSignal()?._id;
    if (!date) return new Set<string>();
    return new Set(
      appointmentsSignal()
        .filter(a => a.date === date && a._id !== editingId && a.status !== 'cancelled')
        .map(a => a.startTime)
    );
  });

  saving    = signal(false);
  deleting  = signal(false);
  /** Reactive mirror of form.date — drives all computed slots/day checks */
  private formDate = signal('');

  form: Partial<Appointment> & { clientId: string } = {
    clientId: '', clientName: '', date: '',
    startTime: '', endTime: '',
    service: '', notes: '', status: 'pending',
    color: APPOINTMENT_COLORS[0],
  };

  hebrewDateLabel = signal('');

  ngOnInit(): void {
    const existing = selectedAppointmentSignal();
    if (existing) {
      this.form = { ...existing };
    } else {
      const sel = selectedDateSignal();
      if (sel) {
        this.form.date = sel >= this.today ? sel : this.today;
      }
      const lc = localClientSignal();
      if (lc?._id) {
        this.form.clientId   = lc._id;
        this.form.clientName = lc.name;
        this.form.color      = lc.color;
      }
    }
    this.formDate.set(this.form.date ?? '');
    this.updateHebrewLabel();
  }

  onClientChange(): void {
    const c = this.clients().find(c => c._id === this.form.clientId);
    if (c) { this.form.clientName = c.name; this.form.color = c.color; }
  }

  onDateChange(): void {
    this.formDate.set(this.form.date ?? '');
    this.form.startTime = '';
    this.form.endTime   = '';
    this.updateHebrewLabel();
  }

  selectSlot(slot: string): void {
    const s = settingsSignal();
    this.form.startTime = slot;
    if (s) {
      const [h, m] = slot.split(':').map(Number);
      const endMin = h * 60 + m + s.slotDuration;
      this.form.endTime =
        `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    }
  }

  private updateHebrewLabel(): void {
    if (!this.form.date) return;
    const [y, m, d] = this.form.date.split('-').map(Number);
    this.hebrewDateLabel.set(this.hebrewSvc.toHebrewDate(new Date(y, m - 1, d)).fullLabel);
  }

  save(): void {
    if (!this.form.clientId || !this.form.date || !this.form.service || !this.form.startTime) return;
    if (this.limitReached()) return;

    // Clients always submit as pending — admin changes the status
    if (localClientSignal()) this.form.status = 'pending';

    this.saving.set(true);
    const existing = selectedAppointmentSignal();
    const obs = existing?._id
      ? this.svc.update(existing._id, this.form)
      : this.svc.create(this.form as Omit<Appointment, '_id'>);
    obs.subscribe({ next: () => { this.saving.set(false); this.close.emit(); } });
  }

  statusBtnColor(value: string): string {
    const map: Record<string, string> = {
      confirmed: '#00b894', pending: '#fdcb6e', cancelled: '#d63031', completed: '#b2bec3',
    };
    return map[value] ?? '#fff';
  }

  delete(): void {
    const id = selectedAppointmentSignal()?._id;
    if (!id) return;
    if (!confirm('למחוק את התור?')) return;
    this.deleting.set(true);
    this.svc.delete(id).subscribe({ next: () => { this.deleting.set(false); this.close.emit(); } });
  }

  statuses: { value: AppointmentStatus; label: string }[] = [
    { value: 'pending',   label: 'ממתין לאישור' },
    { value: 'confirmed', label: 'מאושר' },
    { value: 'cancelled', label: 'בוטל' },
    { value: 'completed', label: 'הושלם' },
  ];
}
