import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  icon?: string;
}

const DEFAULT_ICONS: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 3500, icon?: string): void {
    const id = ++nextId;
    this._toasts.update(list => [
      ...list,
      { id, message, type, icon: icon ?? DEFAULT_ICONS[type] },
    ]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration?: number) { this.show(message, 'success', duration); }
  error  (message: string, duration?: number) { this.show(message, 'error',   duration); }
  info   (message: string, duration?: number) { this.show(message, 'info',    duration); }
  warning(message: string, duration?: number) { this.show(message, 'warning', duration); }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
