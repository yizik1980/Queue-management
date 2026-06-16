import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { BusinessSettings } from '../models/settings.model';
import { settingsSignal, adminIdSignal } from '../store/app.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private get api() { return `${environment.apiUrl}/${adminIdSignal()}/settings`; }

  load() {
    return this.http.get<BusinessSettings>(this.api).pipe(
      map(s => {settingsSignal.set(s); return s; })
    );
  }
}
