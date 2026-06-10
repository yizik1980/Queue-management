import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { BusinessSettings } from '../models/settings.model';
import { settingsSignal } from '../store/app.store';

const API = 'http://localhost:3000/api/settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  load() {
    return this.http.get<BusinessSettings>(API).pipe(
      tap(s => settingsSignal.set(s))
    );
  }
}
