import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast, ToastType } from '../../core/services/toast.service';

const TYPE_CLASSES: Record<ToastType, string> = {
  success: 'border-mint  bg-mint  ',
  error: 'border-crimson bg-crimson ',
  info: 'border-violet  bg-violet  ',
  warning: 'border-amber   bg-amber  ',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-7 left-9 z-[100] flex flex-col gap-2 pointer-events-none"
         aria-live="polite">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg
                 border-2 shadow-[3px_3px_0_#1a1a2e] bg-cream font-body text-sm
                 animate-slide-in max-w-xs"
          [ngClass]="typeClass(toast)"
          dir="rtl"
        >
          <span class="text-base shrink-0">{{ toast.icon }}</span>
          <p class="flex-1 leading-snug">{{ toast.message }}</p>
          <button
            class="shrink-0  hover:opacity-100 transition-opacity text-ink text-xs"
            (click)="toastSvc.dismiss(toast.id)"
            aria-label="סגור"
          >✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateY(110%); opacity: 0; }
      to   { transform: translateY(0%);    opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.6s ease-out; }
  `],
})
export class ToastComponent {
  readonly toastSvc = inject(ToastService);

  typeClass(toast: Toast): string {
    return TYPE_CLASSES[toast.type];
  }
}
