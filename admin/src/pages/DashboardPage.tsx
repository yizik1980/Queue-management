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

const STATUS_META = [
  { key: 'pending',   label: 'ממתין',  color: '#fdcb6e' },
  { key: 'confirmed', label: 'מאושר',  color: '#00b894' },
  { key: 'cancelled', label: 'בוטל',   color: '#d63031' },
  { key: 'completed', label: 'הושלם',  color: '#b2bec3' },
] as const;

const CX = 50, CY = 50, R_OUT = 40, R_IN = 24;

function polarXY(deg: number, r: number): [number, number] {
  const rad = (deg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function donutSlicePath(startDeg: number, endDeg: number): string {
  const [ox1, oy1] = polarXY(startDeg, R_OUT);
  const [ox2, oy2] = polarXY(endDeg,   R_OUT);
  const [ix1, iy1] = polarXY(startDeg, R_IN);
  const [ix2, iy2] = polarXY(endDeg,   R_IN);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return [
    `M ${f(ox1)} ${f(oy1)}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${f(ox2)} ${f(oy2)}`,
    `L ${f(ix2)} ${f(iy2)}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${f(ix1)} ${f(iy1)}`,
    'Z',
  ].join(' ');
}

function DonutChart({ stats }: { stats: AdminStats }) {
  const total = stats.pending + stats.confirmed + stats.cancelled + stats.completed;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate">
        <span className="text-4xl opacity-30">📊</span>
        <p className="text-sm">אין נתונים</p>
      </div>
    );
  }

  const slices: { label: string; count: number; color: string; path: string; pct: number }[] = [];
  let start = 0;

  for (const { key, label, color } of STATUS_META) {
    const count = stats[key];
    const deg   = (count / total) * 360;
    const end   = start + deg;
    slices.push({ label, count, color, path: count > 0 ? donutSlicePath(start, end) : '', pct: Math.round((count / total) * 100) });
    start = end;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG donut */}
      <svg viewBox="0 0 100 100" className="w-44 h-44 shrink-0 drop-shadow-sm">
        {slices.map(s => s.count > 0 && (
          <path key={s.label} d={s.path} fill={s.color} className="hover:opacity-80 transition-opacity" />
        ))}
        <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1a1a2e">{total}</text>
        <text x="50" y="57" textAnchor="middle" fontSize="6"  fill="#636e72">תורים</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {slices.map(s => (
          <div key={s.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-sm text-ink/80 truncate">{s.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-ink">{s.count}</span>
              <span className="text-xs text-slate w-9 text-left">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      {/* Donut chart */}
      {stats && (
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl font-bold text-ink m-0 mb-4">🍩 חתך סטטוס תורים</h2>
          <DonutChart stats={stats} />
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
