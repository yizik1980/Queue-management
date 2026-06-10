import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import {
  appointmentsSignal, addAppointment, updateAppointment, removeAppointment, loadingSignal
} from '../store/app.store';

const API = 'http://localhost:3000/api/appointments';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private http = inject(HttpClient);

  loadAll(): Observable<Appointment[]> {
    loadingSignal.set(true);
    return this.http.get<Appointment[]>(API).pipe(
      tap(list => { appointmentsSignal.set(list); loadingSignal.set(false); })
    );
  }

  create(dto: Omit<Appointment, '_id'>): Observable<Appointment> {
    return this.http.post<Appointment>(API, dto).pipe(
      tap(a => addAppointment(a))
    );
  }

  update(id: string, dto: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${API}/${id}`, dto).pipe(
      tap(a => updateAppointment(a))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`).pipe(
      tap(() => removeAppointment(id))
    );
  }
}
