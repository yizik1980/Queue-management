import { Component, computed, inject } from '@angular/core';
import { currentMonthAppointments } from '../../core/store/app.store';
import { LanguageService } from '../../core/services/language.service';

interface Slice {
  label: string;
  count: number;
  color: string;
  path: string;
  percent: number;
}

const STATUS_META = {
  pending:   { color: '#fdcb6e', labelHe: 'ממתין',  labelEn: 'Pending'   },
  confirmed: { color: '#00b894', labelHe: 'מאושר',   labelEn: 'Confirmed' },
  cancelled: { color: '#d63031', labelHe: 'בוטל',    labelEn: 'Cancelled' },
  completed: { color: '#b2bec3', labelHe: 'הושלם',   labelEn: 'Completed' },
} as const;

const CX = 50, CY = 50, R = 38;

function polarToXY(angleDeg: number): [number, number] {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
}

function slicePath(startDeg: number, endDeg: number): string {
  const [x1, y1] = polarToXY(startDeg);
  const [x2, y2] = polarToXY(endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  template: `
    <div class="flex flex-col gap-3 px-4 py-4">
      <!-- Title -->
      <p class="text-xs font-bold text-ink/60 uppercase tracking-wide m-0">
        {{ langSvc.isRTL() ? 'סטטוס תורים — חודש זה' : 'Appointments — this month' }}
      </p>

      @if (total() === 0) {
        <div class="flex flex-col items-center gap-2 py-6 text-center">
          <span class="text-3xl opacity-25" aria-hidden="true">📊</span>
          <p class="text-xs text-gray-400">
            {{ langSvc.isRTL() ? 'אין תורים החודש' : 'No appointments this month' }}
          </p>
        </div>
      } @else {
        <!-- Pie SVG -->
        <svg viewBox="0 0 100 100" class="w-36 h-36 mx-auto drop-shadow-sm" aria-hidden="true">
          @for (s of slices(); track s.label) {
            @if (s.count > 0) {
              <path
                [attr.d]="s.path"
                [attr.fill]="s.color"
                class="transition-opacity duration-200 hover:opacity-80"
              />
            }
          }
          <!-- Center hole -->
          <circle cx="50" cy="50" r="18" fill="white" />
          <!-- Total count -->
          <text x="50" y="48" text-anchor="middle" font-size="10" font-weight="bold" fill="#1a1a2e">
            {{ total() }}
          </text>
          <text x="50" y="57" text-anchor="middle" font-size="5" fill="#6b7280">
            {{ langSvc.isRTL() ? 'תורים' : 'appts' }}
          </text>
        </svg>

        <!-- Legend -->
        <div class="flex flex-col gap-1.5">
          @for (s of slices(); track s.label) {
            @if (s.count > 0) {
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-sm shrink-0" [style.background]="s.color"></span>
                  <span class="text-xs text-ink/70 truncate">{{ s.label }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-xs font-bold text-ink">{{ s.count }}</span>
                  <span class="text-[0.6rem] text-gray-400">({{ s.percent }}%)</span>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class PieChartComponent {
  readonly langSvc = inject(LanguageService);

  readonly total = computed(() => currentMonthAppointments().length);

  readonly slices = computed<Slice[]>(() => {
    const apts = currentMonthAppointments();
    const total = apts.length;
    if (total === 0) return [];

    const counts = { pending: 0, confirmed: 0, cancelled: 0, completed: 0 };
    for (const a of apts) {
      if (a.status in counts) counts[a.status as keyof typeof counts]++;
    }

    const isRTL = this.langSvc.lang() === 'he';
    const slices: Slice[] = [];
    let startDeg = 0;

    for (const [status, meta] of Object.entries(STATUS_META)) {
      const count = counts[status as keyof typeof counts];
      const deg = (count / total) * 360;
      const endDeg = startDeg + deg;
      slices.push({
        label:   isRTL ? meta.labelHe : meta.labelEn,
        count,
        color:   meta.color,
        path:    count > 0 ? slicePath(startDeg, endDeg) : '',
        percent: Math.round((count / total) * 100),
      });
      startDeg = endDeg;
    }

    return slices;
  });
}
