import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalClientService } from '../../core/services/local-client.service';

@Component({
  selector: 'app-client-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-registration.component.html',
})
export class ClientRegistrationComponent {
  @Output() registered = new EventEmitter<void>();

  private svc = inject(LocalClientService);

  form = { name: '', phone: '', email: '' };
  saving = signal(false);
  error  = signal('');

  async submit(): Promise<void> {
    if (!this.form.name.trim() || !this.form.phone.trim()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.svc.register({
        name:  this.form.name.trim(),
        phone: this.form.phone.trim(),
        email: this.form.email.trim() || undefined,
      });
      this.registered.emit();
    } catch {
      this.error.set('שגיאה בהרשמה — בדוק חיבור לשרת ונסה שנית.');
    } finally {
      this.saving.set(false);
    }
  }
}
