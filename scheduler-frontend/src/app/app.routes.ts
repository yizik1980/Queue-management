import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: ':adminId',
    loadComponent: () =>
      import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
  },
  { path: '**', redirectTo: '' },
];
