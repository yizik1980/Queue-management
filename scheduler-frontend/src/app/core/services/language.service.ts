import { Injectable, signal, computed, effect } from '@angular/core';
import { type Lang, type Translations, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly lang = signal<Lang>(
    (localStorage.getItem(STORAGE_KEY) as Lang | null) === 'en' ? 'en' : 'he',
  );

  readonly tr = computed<Translations>(() => TRANSLATIONS[this.lang()]);
  readonly isRTL = computed(() => this.lang() === 'he');

  constructor() {
    effect(() => {
      document.documentElement.dir = this.tr().dir;
      localStorage.setItem(STORAGE_KEY, this.lang());
    });
  }

  toggle(): void {
    this.lang.set(this.lang() === 'he' ? 'en' : 'he');
  }
}
