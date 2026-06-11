export interface BusinessSettings {
  workingDays: number[];   // 0=Sun … 6=Sat
  startTime: string;       // HH:MM
  endTime: string;
  slotDuration: number;    // minutes
  breakStart: string;
  breakEnd: string;
}

export function generateTimeSlots(settings: BusinessSettings, dateStr: string): string[] {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toStr = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = dateStr === todayStr;
  const nowMin  = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

  const start = toMin(settings.startTime);
  const end   = toMin(settings.endTime);
  const bkS   = toMin(settings.breakStart);
  const bkE   = toMin(settings.breakEnd);

  const slots: string[] = [];
  let cur = start;

  while (cur + settings.slotDuration <= end) {
    if (cur >= bkS && cur < bkE) { cur = bkE; continue; }
    if (cur > nowMin) slots.push(toStr(cur));
    cur += settings.slotDuration;
  }

  return slots;
}

export function generateAllTimeSlots(settings: BusinessSettings): string[] {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toStr = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const start = toMin(settings.startTime);
  const end   = toMin(settings.endTime);
  const bkS   = toMin(settings.breakStart);
  const bkE   = toMin(settings.breakEnd);
  const slots: string[] = [];
  let cur = start;
  while (cur + settings.slotDuration <= end) {
    if (cur >= bkS && cur < bkE) { cur = bkE; continue; }
    slots.push(toStr(cur));
    cur += settings.slotDuration;
  }
  return slots;
}
