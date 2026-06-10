import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/clients.component').then(m => m.ClientsComponent),
  },
  { path: '**', redirectTo: '' },
];
