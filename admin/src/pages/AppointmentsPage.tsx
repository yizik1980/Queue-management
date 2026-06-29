import { useEffect, useState } from 'react';
import { appointmentsApi } from '../services/api';
import {
  appointmentsSignal, filterDateSignal, filterStatusSignal,
  filteredAppointments,
} from '../signals/store';
import type { Appointment, AppointmentStatus } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending:   'ממתין לאישור',
  confirmed: 'מאושר',
  cancelled: 'בוטל',
  completed: 'הושלם',
};

const STATUS_NEXT: Record<AppointmentStatus, { action: string; label: string; color: string }[]> = {
  pending: [
    { action: 'confirmed', label: '✅ אשר',   color: 'bg-mint/20 text-mint border-mint/50' },
    { action: 'cancelled', label: '❌ בטל',   color: 'bg-crimson/15 text-crimson border-crimson/40' },
  ],
  confirmed: [
    { action: 'completed', label: '✔️ סיים',  color: 'bg-gray-100 text-gray-600 border-gray-300' },
    { action: 'cancelled', label: '❌ בטל',   color: 'bg-crimson/15 text-crimson border-crimson/40' },
  ],
  cancelled: [
    { action: 'pending',   label: '↩️ שחזר',  color: 'bg-amber/20 text-yellow-700 border-amber/50' },
  ],
  completed: [],
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status-pill ${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    appointmentsApi.getAll()
      .then(data => { appointmentsSignal.value = data; })
      .finally(() => setLoading(false));
  }, []);

  async function changeStatus(apt: Appointment, newStatus: string) {
    setUpdating(apt._id);
    try {
      const updated = await appointmentsApi.update(apt._id, { status: newStatus as AppointmentStatus });
      appointmentsSignal.value = appointmentsSignal.value.map(a =>
        a._id === apt._id ? { ...a, ...updated } : a,
      );
    } finally {
      setUpdating(null);
    }
  }

  async function deleteApt(id: string) {
    if (!confirm('למחוק את התור? הפעולה אינה הפיכה.')) return;
    setUpdating(id);
    try {
      await appointmentsApi.remove(id);
      appointmentsSignal.value = appointmentsSignal.value.filter(a => a._id !== id);
    } finally {
      setUpdating(null);
    }
  }

  const list = filteredAppointments.value;

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="font-sketch text-3xl font-bold text-ink">📅 ניהול תורים</h1>
        <p className="text-slate text-sm mt-0.5">צפה ועדכן את כל התורים במערכת</p>
      </div>

      {/* Filters */}
      <div className="sketch-box p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="form-label">📅 סינון לפי תאריך</label>
          <input
            className="form-input"
            type="date"
            value={filterDateSignal.value}
            onChange={e => { filterDateSignal.value = e.target.value; }}
          />
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="form-label">📌 סינון לפי סטטוס</label>
          <select
            className="form-input"
            value={filterStatusSignal.value}
            onChange={e => { filterStatusSignal.value = e.target.value; }}
          >
            <option value="">הכל</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        {(filterDateSignal.value || filterStatusSignal.value) && (
          <button
            className="btn bg-cream px-3 py-2 text-sm self-end"
            onClick={() => {
              filterDateSignal.value   = '';
              filterStatusSignal.value = '';
            }}
          >
            ✕ נקה סינון
          </button>
        )}
        <div className="ms-auto self-end text-sm text-slate font-medium">
          {list.length} תורים
        </div>
      </div>

      {/* Table */}
      <div className="sketch-box overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-ink bg-ink rounded-t-lg">
          <h2 className="font-sketch text-lg text-amber m-0">רשימת תורים</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate font-sketch text-lg">⏳ טוען...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-12 text-slate">
            <div className="text-4xl mb-2">📭</div>
            <div>לא נמצאו תורים</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink bg-gray-50 text-slate text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-right font-semibold">תאריך</th>
                  <th className="px-4 py-3 text-right font-semibold">לקוח</th>
                  <th className="px-4 py-3 text-right font-semibold">שירות</th>
                  <th className="px-4 py-3 text-right font-semibold">שעה</th>
                  <th className="px-4 py-3 text-right font-semibold">הערות</th>
                  <th className="px-4 py-3 text-right font-semibold">סטטוס</th>
                  <th className="px-4 py-3 text-right font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {list.map(apt => (
                  <tr
                    key={apt._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    style={{ opacity: updating === apt._id ? 0.5 : 1 }}
                  >
                    <td className="px-4 py-3 font-medium tabular-nums">{apt.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0 border border-ink/20"
                             style={{ background: apt.color }} />
                        <div>
                          <div className="font-medium">{apt.clientName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate">{apt.service}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">
                      {apt.startTime}{apt.endTime ? `–${apt.endTime}` : ''}
                    </td>
                    <td className="px-4 py-3 text-slate text-xs max-w-[120px] truncate">
                      {apt.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={apt.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(STATUS_NEXT[apt.status] ?? []).map(({ action, label, color }) => (
                          <button
                            key={action}
                            className={`btn text-xs px-2 py-1 border flex-1 ${color}`}
                            onClick={() => changeStatus(apt, action)}
                            disabled={updating === apt._id}
                          >
                            {label}
                          </button>
                        ))}
                        {/* The delete button is always available */}
                        <button
                          className="btn text-xs px-2 py-1 bg-crimson/10 text-crimson border-crimson/30"
                          onClick={() => deleteApt(apt._id)}
                          disabled={updating === apt._id}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
