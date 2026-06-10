import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';
import {
  clientsSignal, addClient, updateClient, removeClient
} from '../store/app.store';

const API = 'http://localhost:3000/api/clients';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);

  loadAll(): Observable<Client[]> {
    return this.http.get<Client[]>(API).pipe(
      tap(list => clientsSignal.set(list))
    );
  }

  create(dto: Omit<Client, '_id'>): Observable<Client> {
    return this.http.post<Client>(API, dto).pipe(
      tap(c => addClient(c))
    );
  }

  update(id: string, dto: Partial<Client>): Observable<Client> {
    return this.http.patch<Client>(`${API}/${id}`, dto).pipe(
      tap(c => updateClient(c))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(
      tap(() => removeClient(id))
    );
  }
}
