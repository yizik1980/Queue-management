import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private readonly DB_NAME = 'scheduler_app';
  private readonly STORE   = 'kv';
  private readonly VERSION = 1;
  private db: IDBDatabase | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.VERSION);
      req.onupgradeneeded = e => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE)) {
          db.createObjectStore(this.STORE);
        }
      };
      req.onsuccess = e => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db!);
      };
      req.onerror = e => reject((e.target as IDBOpenDBRequest).error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.STORE, 'readonly').objectStore(this.STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror  = () => reject(req.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.STORE, 'readwrite').objectStore(this.STORE).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.STORE, 'readwrite').objectStore(this.STORE).delete(key);
      req.onsuccess = () => resolve();
      req.onerror  = () => reject(req.error);
    });
  }
}
