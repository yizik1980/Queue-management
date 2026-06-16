import { useEffect, useState } from 'react';
import { settingsApi } from '../services/api';
import type { BusinessSettings } from '../types';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const SLOT_DURATIONS = [15, 20, 30, 45, 60, 90];

const DEFAULT: BusinessSettings = {
  workingDays: [0, 1, 2, 3, 4],
  startTime:   '09:00',
  endTime:     '18:00',
  slotDuration: 30,
  breakStart:  '13:00',
  breakEnd:    '14:00',
};

export default function SettingsPage() {
  const [form,    setForm]    = useState<BusinessSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then(s => setForm(s))
      .finally(() => setLoading(false));
  }, []);

  function toggleDay(day: number) {
    setForm(f => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter(d => d !== day)
        : [...f.workingDays, day].sort(),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await settingsApi.update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate font-sketch text-xl">
        ⏳ טוען הגדרות...
      </div>
    );
  }

  // Preview: generate slots for display
  const previewSlots = generatePreview(form);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-sketch text-3xl font-bold text-ink">⚙️ הגדרות עסק</h1>
        <p className="text-slate text-sm mt-0.5">
          הגדר את ימי וזמני הפעילות — הלקוחות יראו רק את השעות הזמינות
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Business name */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-1">🏪 שם העסק</h2>
          <p className="text-slate text-xs mb-3">
            יוצג ללקוחות בכותרת לוח השנה.
          </p>
          <input
            className="form-input"
            type="text"
            maxLength={80}
            placeholder="לדוגמה: מספרת ישראל"
            dir="rtl"
            value={form.businessName ?? ''}
            onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
          />
        </div>

        {/* Popup message */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-1">💬 הודעה קופצת ללקוחות</h2>
          <p className="text-slate text-xs mb-3">
            ההודעה תוצג ללקוחות כחלון קופץ אחת לכמה דקות. השאר ריק כדי לא להציג הודעה.
          </p>
          <textarea
            className="form-input resize-none w-full"
            rows={3}
            maxLength={300}
            placeholder="לדוגמה: שימו לב — מחר סגור בשל חג!"
            dir="rtl"
            value={form.popupMessage ?? ''}
            onChange={e => setForm(f => ({ ...f, popupMessage: e.target.value }))}
          />
          <div className="text-xs text-slate text-left mt-1">
            {(form.popupMessage ?? '').length} / 300
          </div>
        </div>

        {/* Working days */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-3">📅 ימי עבודה</h2>
          <div className="flex flex-wrap gap-2">
            {DAY_NAMES.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`btn px-4 py-2 text-sm transition-colors ${
                  form.workingDays.includes(i)
                    ? 'bg-mint text-white border-mint'
                    : 'bg-white text-slate'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-4">🕐 שעות פעילות</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">פתיחה</label>
              <input
                className="form-input"
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">סגירה</label>
              <input
                className="form-input"
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Break */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-4">☕ הפסקה</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">תחילת הפסקה</label>
              <input
                className="form-input"
                type="time"
                value={form.breakStart}
                onChange={e => setForm(f => ({ ...f, breakStart: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">סוף הפסקה</label>
              <input
                className="form-input"
                type="time"
                value={form.breakEnd}
                onChange={e => setForm(f => ({ ...f, breakEnd: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Slot duration */}
        <div className="sketch-box p-5">
          <h2 className="font-sketch text-xl text-ink mb-3">⏱️ משך כל תור</h2>
          <div className="flex flex-wrap gap-2">
            {SLOT_DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setForm(f => ({ ...f, slotDuration: d }))}
                className={`btn px-4 py-2 text-sm ${
                  form.slotDuration === d
                    ? 'bg-violet text-white border-violet'
                    : 'bg-white text-slate'
                }`}
              >
                {d} דק׳
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {previewSlots.length > 0 && (
          <div className="sketch-box p-5">
            <h2 className="font-sketch text-xl text-ink mb-3">
              👁️ תצוגה מקדימה — {previewSlots.length} משבצות ביום
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {previewSlots.map(s => (
                <span key={s}
                  className="font-mono text-xs px-2.5 py-1 rounded border-2 border-ink bg-white"
                  style={{ boxShadow: '1px 1px 0 #1a1a2e' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn bg-mint text-white px-6 py-2.5 text-base"
          >
            {saving ? '⏳ שומר...' : '💾 שמור הגדרות'}
          </button>
          {saved && (
            <span className="text-mint font-sketch text-lg">✅ נשמר!</span>
          )}
        </div>

      </form>
    </div>
  );
}

function generatePreview(s: BusinessSettings): string[] {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toStr = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

  const start = toMin(s.startTime);
  const end   = toMin(s.endTime);
  const bkS   = toMin(s.breakStart);
  const bkE   = toMin(s.breakEnd);
  const slots: string[] = [];
  let cur = start;

  while (cur + s.slotDuration <= end) {
    if (cur >= bkS && cur < bkE) { cur = bkE; continue; }
    slots.push(toStr(cur));
    cur += s.slotDuration;
  }
  return slots;
}
