import { useEffect, useState } from 'react';
import { clientsApi } from '../services/api';
import {
  clientsSignal, appointmentsSignal, appointmentCountByClient,
} from '../signals/store';
import type { Client } from '../types';

export default function ClientsPage() {
  const [loading,  setLoading]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([clientsApi.getAll(), appointmentsSignal.value.length === 0
      ? import('../services/api').then(m => m.appointmentsApi.getAll()) : Promise.resolve(appointmentsSignal.value),
    ]).then(([clients, apps]) => {
      clientsSignal.value      = clients;
      appointmentsSignal.value = Array.isArray(apps) ? apps : appointmentsSignal.value;
    }).finally(() => setLoading(false));
  }, []);

  async function deleteClient(id: string) {
    if (!confirm('למחוק את הלקוח? הפעולה אינה הפיכה.')) return;
    setDeleting(id);
    try {
      await clientsApi.remove(id);
      clientsSignal.value = clientsSignal.value.filter(c => c._id !== id);
    } finally {
      setDeleting(null);
    }
  }

  const countMap = appointmentCountByClient.value;
  const filtered = clientsSignal.value.filter(c =>
    !search ||
    c.name.includes(search) ||
    c.phone.includes(search) ||
    c.email?.includes(search),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="font-sketch text-3xl font-bold text-ink">👥 ניהול לקוחות</h1>
        <p className="text-slate text-sm mt-0.5">
          {clientsSignal.value.length} לקוחות רשומים במערכת
        </p>
      </div>

      {/* Search */}
      <div className="sketch-box p-4 flex gap-3 items-center">
        <div className="flex-1">
          <input
            className="form-input"
            type="search"
            placeholder="🔍 חיפוש לפי שם, טלפון או אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate font-medium shrink-0">
          {filtered.length} תוצאות
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate font-sketch text-lg">⏳ טוען לקוחות...</div>
      ) : filtered.length === 0 ? (
        <div className="sketch-box text-center py-12 text-slate">
          <div className="text-4xl mb-2">👤</div>
          <div>לא נמצאו לקוחות</div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(client => (
            <ClientCard
              key={client._id}
              client={client}
              activeCount={countMap.get(client._id) ?? 0}
              deleting={deleting === client._id}
              onDelete={() => deleteClient(client._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, activeCount, deleting, onDelete }: {
  client: Client;
  activeCount: number;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className="sketch-box p-5 flex flex-col gap-3"
      style={{ opacity: deleting ? 0.5 : 1 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center text-white font-sketch text-lg font-bold shrink-0"
          style={{ background: client.color }}
        >
          {client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink truncate">{client.name}</div>
          <div className="text-xs text-slate truncate">{client.phone}</div>
        </div>
        {activeCount > 0 && (
          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-violet/15 text-violet border border-violet/30 font-semibold">
            {activeCount} פעיל
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1 text-sm text-slate">
        {client.email && (
          <div className="truncate">✉️ {client.email}</div>
        )}
        {client.notes && (
          <div className="text-xs italic truncate">📝 {client.notes}</div>
        )}
        {client.createdAt && (
          <div className="text-xs">
            📅 נרשם: {new Date(client.createdAt).toLocaleDateString('he-IL')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button
          className="btn text-xs px-3 py-1.5 bg-crimson/10 text-crimson border-crimson/30 w-full"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? '⏳' : '🗑 מחק'}
        </button>
      </div>
    </div>
  );
}
