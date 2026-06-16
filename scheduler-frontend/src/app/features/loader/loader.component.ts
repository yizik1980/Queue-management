import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    <div
      role="status"
      aria-live="polite"
      class="fixed bottom-5 end-5 z-50 flex items-center gap-3 bg-ink text-amber border-2 border-amber/40 rounded-full px-5 py-2.5 font-sketch text-sm"
      style="box-shadow: 3px 3px 0 rgb(var(--c-amber) / 0.2)"
    >
      <div class="loader-dots text-amber" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      {{ label() }}
    </div>
  `,
})
export class LoaderComponent {
  readonly label = input('טוען...');
}
