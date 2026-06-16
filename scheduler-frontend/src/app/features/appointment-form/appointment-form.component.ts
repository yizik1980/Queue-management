import {
  Component, OnInit, OnDestroy, AfterViewInit,
  Output, EventEmitter, HostListener, ElementRef,
  inject, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { generateTimeSlots } from '../../core/models/settings.model';
import { AppointmentsService } from '../../core/services/appointments.service';
import { HebrewDateService } from '../../core/services/hebrew-date.service';
import { LanguageService } from '../../core/services/language.service';
import {
  clientsSignal, selectedAppointmentSignal, selectedDateSignal,
  localClientSignal, localClientActiveAppointments, settingsSignal,
  appointmentsSignal,
} from '../../core/store/app.store';

const APPOINTMENT_COLORS = [
  '#e84393', '#6c5ce7', '#00b894', '#fdcb6e', '#0984e3',
  '#e17055', '#a29bfe', '#55efc4', '#fab1a0', '#74b9ff',
];

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex="0"]';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
})
export class AppointmentFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  private svc        = inject(AppointmentsService);
  private hebrewSvc  = inject(HebrewDateService);
  private el         = inject(ElementRef<HTMLElement>);
  readonly langSvc   = inject(LanguageService);

  private previouslyFocused: HTMLElement | null = null;

  readonly clients     = clientsSignal;
  readonly localClient = localClientSignal;
  readonly editing     = computed(() => !!selectedAppointmentSignal());
  readonly colors      = APPOINTMENT_COLORS;

  readonly today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  readonly limitReached = computed(() => {
    if (!localClientSignal()) return false;
    if (selectedAppointmentSignal()) return false;
    return localClientActiveAppointments().length >= 2;
  });

  readonly isWorkingDay = computed(() => {
    const s = settingsSignal();
    const date = this.formDate();
    if (!s || !date) return true;
    const dow = new Date(date + 'T12:00:00').getDay();
    return s.workingDays.includes(dow);
  });

  readonly closedDayName = computed(() => {
    const date = this.formDate();
    if (!date) return '';
    return this.langSvc.tr().dayNames[new Date(date + 'T12:00:00').getDay()];
  });

  readonly allSlots = computed(() => {
    const s = settingsSignal();
    const date = this.formDate();
    if (!s || !date || !this.isWorkingDay()) return [];
    return generateTimeSlots(s, date);
  });

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

  readonly statuses = computed<{ value: AppointmentStatus; label: string }[]>(() => [
    { value: 'pending',   label: this.langSvc.tr().statusPending },
    { value: 'confirmed', label: this.langSvc.tr().statusConfirmed },
    { value: 'cancelled', label: this.langSvc.tr().statusCancelled },
    { value: 'completed', label: this.langSvc.tr().statusCompleted },
  ]);

  saving           = signal(false);
  deleting         = signal(false);
  confirmingDelete = signal(false);
  private formDate = signal('');

  form: Partial<Appointment> & { clientId: string } = {
    clientId: '', clientName: '', date: '',
    startTime: '', endTime: '',
    service: '', notes: '', status: 'pending',
    color: APPOINTMENT_COLORS[0],
  };

  hebrewDateLabel = signal('');

  ngOnInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement;

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

  ngAfterViewInit(): void {
    const first = (this.el.nativeElement as HTMLElement).querySelector(FOCUSABLE) as HTMLElement | null;
    first?.focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  // Focus trap — keep keyboard navigation inside the dialog
  @HostListener('document:keydown.tab', ['$event'])
  onTab(e: Event): void {
    const ke = e as KeyboardEvent;
    const nodes = Array.from(
      (this.el.nativeElement as HTMLElement).querySelectorAll(FOCUSABLE)
    ) as HTMLElement[];
    if (!nodes.length) return;
    const first = nodes[0];
    const last  = nodes[nodes.length - 1];
    if (ke.shiftKey && document.activeElement === first) {
      ke.preventDefault(); last.focus();
    } else if (!ke.shiftKey && document.activeElement === last) {
      ke.preventDefault(); first.focus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }

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
    this.deleting.set(true);
    this.svc.delete(id).subscribe({ next: () => { this.deleting.set(false); this.close.emit(); } });
  }
}
