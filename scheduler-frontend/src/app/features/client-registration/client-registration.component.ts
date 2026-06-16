import {
  Component, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit,
  HostListener, ElementRef, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalClientService } from '../../core/services/local-client.service';
import { LanguageService } from '../../core/services/language.service';

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea';

@Component({
  selector: 'app-client-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-registration.component.html',
})
export class ClientRegistrationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() registered = new EventEmitter<void>();

  private svc      = inject(LocalClientService);
  private el       = inject(ElementRef<HTMLElement>);
  readonly langSvc = inject(LanguageService);

  private previouslyFocused: HTMLElement | null = null;

  form   = { name: '', phone: '', email: '' };
  saving = signal(false);
  error  = signal('');

  ngOnInit(): void {
    this.previouslyFocused = document.activeElement as HTMLElement;
  }

  ngAfterViewInit(): void {
    const first = (this.el.nativeElement as HTMLElement).querySelector(FOCUSABLE) as HTMLElement | null;
    first?.focus();
  }

  ngOnDestroy(): void {
    this.previouslyFocused?.focus();
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(e: Event): void {
    const ke = e as KeyboardEvent;
    const nodes = Array.from(
      (this.el.nativeElement as HTMLElement).querySelectorAll(FOCUSABLE)
    ) as HTMLElement[];
    if (!nodes.length) return;
    const first = nodes[0];
    const last  = nodes[nodes.length - 1];
    if (ke.shiftKey && document.activeElement === first) {
      ke.preventDefault(); last.focus();
    } else if (!ke.shiftKey && document.activeElement === last) {
      ke.preventDefault(); first.focus();
    }
  }

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
      this.error.set(this.langSvc.tr().registrationError);
    } finally {
      this.saving.set(false);
    }
  }
}
