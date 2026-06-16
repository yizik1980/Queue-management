import { Component, OnInit, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

export interface MiniCalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-20" (click)="close.emit()"></div>

    <!-- Panel -->
    <div
      class="absolute inset-x-0 top-full z-30 bg-white border-b-2 border-ink"
      style="box-shadow: 0 4px 0 rgba(26,26,46,0.15)"
      (click)="$event.stopPropagation()"
    >
      <!-- Month navigation -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <button
          class="btn-sketch bg-amber px-2.5 py-0.5 text-base font-bold"
          type="button"
          aria-label="חודש קודם"
          (click)="prevMonth()"
        >←</button>
        <span class="font-sketch font-bold text-sm text-ink">{{ pickerMonthTitle() }}</span>
        <button
          class="btn-sketch bg-amber px-2.5 py-0.5 text-base font-bold"
          type="button"
          aria-label="חודש הבא"
          (click)="nextMonth()"
        >→</button>
      </div>

      <!-- Weekday labels -->
      <div class="grid grid-cols-7 text-center px-1 pt-1.5">
        @for (wd of weekDays(); track wd) {
          <div class="text-[0.6rem] font-bold text-violet py-0.5">{{ wd }}</div>
        }
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 px-1 pb-2 gap-0.5">
        @for (day of pickerDays(); track day.dateStr) {
          <button
            type="button"
            class="aspect-square flex items-center justify-center text-xs rounded font-semibold transition-colors"
            [ngClass]="dayClass(day)"
            [disabled]="!day.isCurrentMonth || day.isPast"
            (click)="daySelect.emit(day)"
          >{{ day.date.getDate() }}</button>
        }
      </div>
    </div>
  `,
})
export class MiniCalendarComponent implements OnInit {
  private langSvc = inject(LanguageService);

  readonly selectedDate = input<string>('');
  readonly weekDays = computed(() => this.langSvc.tr().weekDays);

  readonly daySelect = output<MiniCalendarDay>();
  readonly close     = output<void>();

  readonly pickerMonth = signal(new Date());

  readonly pickerMonthTitle = computed(() => {
    const d = this.pickerMonth();
    const t = this.langSvc.tr();
    return `${t.months[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly pickerDays = computed<MiniCalendarDay[]>(() => {
    const d       = this.pickerMonth();
    const first   = new Date(d.getFullYear(), d.getMonth(), 1);
    const last    = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const todayStr = this.toDateStr(new Date());
    const selStr   = this.selectedDate();
    const days: MiniCalendarDay[] = [];

    for (let i = first.getDay() - 1; i >= 0; i--) {
      const date = new Date(first); date.setDate(date.getDate() - i - 1);
      const ds = this.toDateStr(date);
      days.push({ date, dateStr: ds, isCurrentMonth: false, isPast: ds < todayStr, isToday: ds === todayStr, isSelected: ds === selStr });
    }
    for (let n = 1; n <= last.getDate(); n++) {
      const date = new Date(d.getFullYear(), d.getMonth(), n);
      const ds = this.toDateStr(date);
      days.push({ date, dateStr: ds, isCurrentMonth: true, isPast: ds < todayStr, isToday: ds === todayStr, isSelected: ds === selStr });
    }
    const rem = days.length % 7;
    if (rem !== 0) {
      for (let i = 1; i <= 7 - rem; i++) {
        const date = new Date(last); date.setDate(date.getDate() + i);
        const ds = this.toDateStr(date);
        days.push({ date, dateStr: ds, isCurrentMonth: false, isPast: ds < todayStr, isToday: ds === todayStr, isSelected: ds === selStr });
      }
    }
    return days;
  });

  ngOnInit(): void {
    const sel = this.selectedDate();
    if (sel) {
      const [y, m] = sel.split('-').map(Number);
      this.pickerMonth.set(new Date(y, m - 1, 1));
    }
  }

  prevMonth(): void {
    const d = this.pickerMonth();
    this.pickerMonth.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.pickerMonth();
    this.pickerMonth.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  dayClass(day: MiniCalendarDay): string {
    if (!day.isCurrentMonth || day.isPast) return 'text-gray-300 pointer-events-none';
    if (day.isSelected) return 'bg-violet text-white';
    if (day.isToday)    return 'bg-amber/30 text-ink';
    return 'text-ink hover:bg-mint/10';
  }

  private toDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
