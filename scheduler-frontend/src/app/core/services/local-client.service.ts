import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientsService } from './clients.service';
import { IndexedDbService } from './indexed-db.service';
import { localClientSignal } from '../store/app.store';

const CLIENT_KEY = 'local_client';
const COLORS = ['#e84393','#6c5ce7','#00b894','#fdcb6e','#0984e3','#e17055','#a29bfe','#55efc4'];

@Injectable({ providedIn: 'root' })
export class LocalClientService {
  private idb       = inject(IndexedDbService);
  private clientSvc = inject(ClientsService);

  /** Called on app start — loads client from IndexedDB and sets the signal. */
  async loadOrNull(): Promise<Client | null> {
    const saved = await this.idb.get<Client>(CLIENT_KEY);
    if (saved) localClientSignal.set(saved);
    return saved;
  }

  /** Creates client in backend, persists to IndexedDB, sets signal. */
  async register(dto: { name: string; phone: string; email?: string }): Promise<Client> {
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    const client = await firstValueFrom(
      this.clientSvc.create({ name: dto.name, phone: dto.phone, email: dto.email ?? '', color })
    );
    await this.idb.set(CLIENT_KEY, client);
    localClientSignal.set(client);
    return client;
  }

  /** Removes the local client (useful for dev/testing). */
  async clear(): Promise<void> {
    await this.idb.delete(CLIENT_KEY);
    localClientSignal.set(null);
  }
}
