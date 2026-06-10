import { Injectable, signal } from '@angular/core';

export type ThemeName = 'sketch' | 'clean';

const THEMES: ThemeName[]  = ['sketch', 'clean'];
const STORAGE_KEY          = 'app_theme';
const THEME_LABELS: Record<ThemeName, string> = {
  sketch: '✏️ קריקטורה',
  clean:  '🎯 נקי',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly themes     = THEMES;
  readonly labels     = THEME_LABELS;
  readonly current    = signal<ThemeName>('sketch');

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
