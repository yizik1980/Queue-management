import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';
import {
  addClient, updateClient, removeClient
} from '../store/app.store';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/clients`;
const A = `admin=${environment.adminUsername}`;

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);

  create(dto: Omit<Client, '_id'>): Observable<Client> {
    return this.http.post<Client>(`${API}?${A}`, dto).pipe(
      tap(c => addClient(c))
    );
  }

  update(id: string, dto: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${API}/${id}?${A}`, dto).pipe(
      tap(c => updateClient(c))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}?${A}`).pipe(
      tap(() => removeClient(id))
    );
  }
}
