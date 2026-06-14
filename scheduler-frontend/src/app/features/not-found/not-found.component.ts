import { Component, input } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  adminId = input<string>('');
  readonly circles = Array(14).fill(0);
}
