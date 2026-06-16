import {
  Component, input, output, AfterViewInit, OnDestroy, OnInit,
  HostListener, ElementRef, inject, viewChild,
} from '@angular/core';

@Component({
  selector: 'app-popup-message',
  standalone: true,
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4"
         aria-hidden="true"
         (click)="close.emit()"></div>

    <!-- Dialog -->
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="popup-msg-title"
      class="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none"
    >
      <div class="relative max-w-sm w-full bg-cream border-2 border-ink rounded-xl p-6 text-center pointer-events-auto"
           style="box-shadow: 4px 4px 0 #1a1a2e"
           (click)="$event.stopPropagation()">
        <div class="text-3xl mb-3" aria-hidden="true">{{ icon() }}</div>
        <p id="popup-msg-title" class="font-body text-ink text-base leading-relaxed whitespace-pre-wrap" dir="rtl">
          {{ message() }}
        </p>
        <button
          #closeBtn
          class="btn-sketch mt-5 bg-mint text-ink px-6 py-2 text-sm"
          (click)="close.emit()"
        >הבנתי</button>
      </div>
    </div>
  `,
})
export class PopupMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly message  = input.required<string>();
  readonly icon     = input<string>('📢');
  readonly close    = output<void>();

  private el = inject(ElementRef<HTMLElement>);
  private previouslyFocused: HTMLElement | null = null;

  ngOnInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement;
  }

  ngAfterViewInit(): void {
    const btn = (this.el.nativeElement as HTMLElement).querySelector('button') as HTMLElement | null;
    btn?.focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(e: Event): void {
    const btn = (this.el.nativeElement as HTMLElement).querySelector('button') as HTMLElement | null;
    if (btn) { e.preventDefault(); btn.focus(); }
  }
}
