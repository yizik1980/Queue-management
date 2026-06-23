import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-700"
        [class.opacity-0]="fading()"
        aria-hidden="true"
      >
        <div class="flex flex-col items-center gap-4">
          <h1 class="text-3xl font-bold text-ink tracking-wide"
              style="font-family: 'Segoe UI', sans-serif">
            מערכת לניהול תורים
          </h1>
          <img
            src="/ch.png"
            alt=""
            class="max-h-[55vh] max-w-[55vw] object-contain drop-shadow-2xl
                   transition-transform duration-700"
            [class.scale-90]="fading()"
            [class.scale-100]="!fading()"
          />
        </div>
      </div>
    }
  `,
})
export class SplashComponent implements OnInit {
  visible = signal(true);
  fading  = signal(false);

  ngOnInit(): void {
    setTimeout(() => this.fading.set(true), 2200);
    setTimeout(() => this.visible.set(false), 2900);
  }
}
