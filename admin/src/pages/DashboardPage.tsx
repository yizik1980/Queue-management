import { useEffect, useState } from 'react';
import { statsApi, appointmentsApi } from '../services/api';
import {
  statsSignal, appointmentsSignal, loadingSignal,
} from '../signals/store';
import type { AdminStats, Appointment } from '../types';

const STATUS_LABELS: Record<string, string> = {
  pending:   'ממתין',
  confirmed: 'מאושר',
  cancelled: 'בוטל',
  completed: 'הושלם',
};

function StatCard({ icon, label, value, color }: {
  icon: string; label: string; value: number; color: string;
}) {
  return (
    <div className="stat-card">
      <div className="text-3xl">{icon}</div>
      <div className={`text-3xl font-sketch font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate font-medium">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`status-pill ${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(statsSignal.value);
  const [recent, setRecent] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(loadingSignal.value);

  useEffect(() => {
    setLoading(true);
    Promise.all([statsApi.get(), appointmentsApi.getAll()])
      .then(([s, apps]) => {
        setStats(s);
        statsSignal.value = s;
        appointmentsSignal.value = apps;
        // Last 8 sorted by date desc
        setRecent([...apps].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate font-sketch text-xl">
        ⏳ טוען נתונים...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="font-sketch text-3xl font-bold text-ink">📊 דשבורד</h1>
        <p className="text-slate text-sm mt-0.5">סקירה כללית של מערכת התורים</p>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard icon="📅" label="סה״כ תורים"    value={stats.total}     color="text-ink"    />
          <StatCard icon="🌅" label="תורים היום"     value={stats.today}     color="text-violet" />
          <StatCard icon="⏳" label="ממתינים לאישור" value={stats.pending}   color="text-yellow-600" />
          <StatCard icon="✅" label="מאושרים"        value={stats.confirmed} color="text-mint"   />
          <StatCard icon="✔️" label="הושלמו"         value={stats.completed} color="text-slate"  />
          <StatCard icon="❌" label="בוטלו"          value={stats.cancelled} color="text-crimson" />
          <StatCard icon="👥" label="לקוחות"         value={stats.clients}   color="text-violet" />
        </div>
      )}

      {/* Recent appointments */}
      <div className="sketch-box overflow-hidden">
        <div className="px-5 py-4 border-b-2 border-ink bg-ink rounded-t-lg">
          <h2 className="font-sketch text-xl text-amber m-0">📋 תורים אחרונים</h2>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-slate">אין תורים עדיין</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink bg-gray-50 text-slate text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-right font-semibold">תאריך</th>
                  <th className="px-4 py-3 text-right font-semibold">לקוח</th>
                  <th className="px-4 py-3 text-right font-semibold">שירות</th>
                  <th className="px-4 py-3 text-right font-semibold">שעה</th>
                  <th className="px-4 py-3 text-right font-semibold">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(apt => (
                  <tr key={apt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{apt.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0 border border-ink/20"
                             style={{ background: apt.color }} />
                        {apt.clientName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate">{apt.service}</td>
                    <td className="px-4 py-3 font-mono text-xs">{apt.startTime}–{apt.endTime}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={apt.status} />
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
