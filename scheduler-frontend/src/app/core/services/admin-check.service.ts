import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminCheckService {
  private http = inject(HttpClient);

  exists(adminId: string): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/${adminId}/check`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
