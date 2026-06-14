import { Injectable, signal } from '@angular/core';

export type ThemeName = 'sketch' | 'clean' | 'green';

const THEMES: ThemeName[] = ['sketch', 'clean', 'green'];
const STORAGE_KEY = 'app_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes  = THEMES;
  readonly current = signal<ThemeName>('sketch');

  apply(theme: ThemeName): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.current.set(theme);
  }

  loadSaved(): void {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    this.apply(saved && THEMES.includes(saved) ? saved : 'sketch');
  }

  toggle(): void {
    const next = THEMES[(THEMES.indexOf(this.current()) + 1) % THEMES.length];
    this.apply(next);
  }
}
