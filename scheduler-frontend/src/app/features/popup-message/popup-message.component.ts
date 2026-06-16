import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-popup-message',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
         (click)="close.emit()">
      <div class="relative max-w-sm w-full bg-cream border-2 border-ink rounded-xl p-6 text-center"
           style="box-shadow: 4px 4px 0 #1a1a2e"
           (click)="$event.stopPropagation()">
        <div class="text-3xl mb-3">{{ icon() }}</div>
        <p class="font-body text-ink text-base leading-relaxed whitespace-pre-wrap" dir="rtl">
          {{ message() }}
        </p>
        <button
          class="btn-sketch mt-5 bg-mint text-white px-6 py-2 text-sm"
          (click)="close.emit()"
        >הבנתי</button>
      </div>
    </div>
  `,
})
export class PopupMessageComponent {
  readonly message = input.required<string>();
  readonly icon    = input<string>('📢');
  readonly close   = output<void>();
}
