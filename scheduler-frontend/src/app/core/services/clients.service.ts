import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';
import {
  addClient, updateClient, removeClient, adminIdSignal,
} from '../store/app.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private get api() { return `${environment.apiUrl}/${adminIdSignal()}/clients`; }

  create(dto: Omit<Client, '_id'>): Observable<Client> {
    return this.http.post<Client>(this.api, dto).pipe(
      tap(c => addClient(c))
    );
  }

  update(id: string, dto: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${this.api}/${id}`, dto).pipe(
      tap(c => updateClient(c))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      tap(() => removeClient(id))
    );
  }
}
