import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';

type ClockMode = 'digital' | 'analog';

@Component({
  selector: 'app-clock',
  standalone: true,
  template: `
    <div class="flex flex-col items-center gap-2 py-3 px-4">

      <!-- Toggle -->
      <div class="flex rounded-full overflow-hidden border border-ink/20 text-[0.65rem] font-bold">
        <button
          class="px-3 py-0.5 transition-colors"
          [class.bg-ink]="mode() === 'digital'"
          [class.text-white]="mode() === 'digital'"
          [class.text-ink]="mode() !== 'digital'"
          (click)="mode.set('digital')"
          aria-label="שעון דיגיטלי"
        >דיגיטלי</button>
        <button
          class="px-3 py-0.5 transition-colors"
          [class.bg-ink]="mode() === 'analog'"
          [class.text-white]="mode() === 'analog'"
          [class.text-ink]="mode() !== 'analog'"
          (click)="mode.set('analog')"
          aria-label="שעון אנלוגי"
        >אנלוגי</button>
      </div>

      <!-- Digital -->
      @if (mode() === 'digital') {
        <div class="font-mono font-bold text-2xl text-ink tracking-widest tabular-nums select-none"
             [attr.aria-label]="'השעה ' + digitalTime()">
          {{ digitalTime() }}
        </div>
      }

      <!-- Analog -->
      @if (mode() === 'analog') {
        <svg
          viewBox="0 0 100 100"
          class="w-28 h-28"
          role="img"
          [attr.aria-label]="'שעון אנלוגי, ' + digitalTime()"
        >
          <!-- Face -->
          <circle cx="50" cy="50" r="46" fill="white" stroke="#1a1a2e" stroke-width="2.5"/>

          <!-- Hour ticks -->
          @for (tick of hourTicks; track tick) {
            <line
              [attr.x1]="50 + 38 * sin(tick * 30)"
              [attr.y1]="50 - 38 * cos(tick * 30)"
              [attr.x2]="50 + 43 * sin(tick * 30)"
              [attr.y2]="50 - 43 * cos(tick * 30)"
              stroke="#1a1a2e" stroke-width="2" stroke-linecap="round"
            />
          }

          <!-- Hour numbers -->
          @for (tick of hourTicks; track tick) {
            <text
              [attr.x]="50 + 31 * sin(tick * 30)"
              [attr.y]="50 - 31 * cos(tick * 30) + 2.5"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="7"
              font-weight="bold"
              font-family="sans-serif"
              fill="#1a1a2e"
            >{{ tick === 0 ? 12 : tick }}</text>
          }

          <!-- Minute ticks -->
          @for (tick of minuteTicks; track tick) {
            <line
              [attr.x1]="50 + 40 * sin(tick * 6)"
              [attr.y1]="50 - 40 * cos(tick * 6)"
              [attr.x2]="50 + 43 * sin(tick * 6)"
              [attr.y2]="50 - 43 * cos(tick * 6)"
              stroke="#1a1a2e" stroke-width="0.8" stroke-linecap="round"
            />
          }

          <!-- Hour hand -->
          <line
            x1="50" y1="50"
            [attr.x2]="50 + 24 * sin(hourAngle())"
            [attr.y2]="50 - 24 * cos(hourAngle())"
            stroke="#1a1a2e" stroke-width="3.5" stroke-linecap="round"
          />

          <!-- Minute hand -->
          <line
            x1="50" y1="50"
            [attr.x2]="50 + 33 * sin(minuteAngle())"
            [attr.y2]="50 - 33 * cos(minuteAngle())"
            stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"
          />

          <!-- Second hand -->
          <line
            x1="50" y1="50"
            [attr.x2]="50 + 36 * sin(secondAngle())"
            [attr.y2]="50 - 36 * cos(secondAngle())"
            stroke="#e63946" stroke-width="1.2" stroke-linecap="round"
          />

          <!-- Center dot -->
          <circle cx="50" cy="50" r="2.5" fill="#1a1a2e"/>
        </svg>
      }
    </div>
  `,
})
export class ClockComponent implements OnInit, OnDestroy {
  mode = signal<ClockMode>('digital');
  private now = signal<Date>(new Date());
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly hourTicks  = Array.from({ length: 12  }, (_, i) => i);
  readonly minuteTicks = Array.from({ length: 60 }, (_, i) => i);

  readonly digitalTime = computed(() => {
    const d = this.now();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  });

  readonly hourAngle = computed(() => {
    const d = this.now();
    return (d.getHours() % 12) * 30 + d.getMinutes() * 0.5;
  });

  readonly minuteAngle = computed(() => {
    const d = this.now();
    return d.getMinutes() * 6 + d.getSeconds() * 0.1;
  });

  readonly secondAngle = computed(() => {
    return this.now().getSeconds() * 6;
  });

  ngOnInit(): void {
    this.intervalId = setInterval(() => this.now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) clearInterval(this.intervalId);
  }

  sin(deg: number): number { return Math.sin((deg * Math.PI) / 180); }
  cos(deg: number): number { return Math.cos((deg * Math.PI) / 180); }
}
