import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import {
  appointmentsSignal, addAppointment, updateAppointment, removeAppointment, loadingSignal,
  adminIdSignal, localClientSignal,
} from '../store/app.store';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private http = inject(HttpClient);
  private get api() { return `${environment.apiUrl}/${adminIdSignal()}/appointments`; }

  loadAll(): Observable<Appointment[]> {
    loadingSignal.set(true);
    return this.http.get<Appointment[]>(this.api).pipe(
      tap(list => { appointmentsSignal.set(list); loadingSignal.set(false); })
    );
  }

  create(dto: Omit<Appointment, '_id'>): Observable<Appointment> {
    return this.http.post<Appointment>(this.api, dto).pipe(
      tap(a => addAppointment(a))
    );
  }

  update(id: string, dto: Partial<Appointment>): Observable<Appointment> {
    const clientId = localClientSignal()?._id;
    const params = clientId ? { clientId } : undefined;
    return this.http.patch<Appointment>(`${this.api}/${id}`, dto, { params }).pipe(
      tap(a => updateAppointment(a))
    );
  }

  delete(id: string): Observable<void> {
    const clientId = localClientSignal()?._id;
    const params = clientId ? { clientId } : undefined;
    return this.http.delete<void>(`${this.api}/${id}`, { params }).pipe(
      tap(() => removeAppointment(id))
    );
  }
}
