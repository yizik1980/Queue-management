import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../core/models/client.model';
import { ClientsService } from '../../core/services/clients.service';
import { clientsSignal } from '../../core/store/app.store';

const COLORS = [
  '#e84393', '#6c5ce7', '#00b894', '#fdcb6e',
  '#0984e3', '#e17055', '#a29bfe', '#55efc4',
];

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit {
  private svc = inject(ClientsService);
  private router = inject(Router);

  readonly clients = clientsSignal;
  readonly colors = COLORS;

  saving = signal(false);
  editingId = signal<string | null>(null);
  showAddForm = signal(false);

  form: Partial<Client> = {
    name: '', phone: '', email: '', notes: '', color: COLORS[0],
  };

  ngOnInit(): void {
    this.svc.loadAll().subscribe();
  }

  startAdd(): void {
    this.form = { name: '', phone: '', email: '', notes: '', color: COLORS[0] };
    this.editingId.set(null);
    this.showAddForm.set(true);
  }

  startEdit(c: Client): void {
    this.form = { ...c };
    this.editingId.set(c._id ?? null);
    this.showAddForm.set(true);
  }

  save(): void {
    if (!this.form.name || !this.form.phone) return;
    this.saving.set(true);
    const id = this.editingId();
    const obs = id
      ? this.svc.update(id, this.form)
      : this.svc.create(this.form as Omit<Client, '_id'>);
    obs.subscribe({ next: () => { this.saving.set(false); this.showAddForm.set(false); } });
  }

  delete(id: string): void {
    if (!confirm('למחוק לקוח זה?')) return;
    this.svc.delete(id).subscribe();
  }

  back(): void { this.router.navigate(['/']); }
}
