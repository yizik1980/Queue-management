import { Injectable } from '@angular/core';
import { HDate } from '@hebcal/core';

// Hebrew month names by month number (1=Nisan, 7=Tishrei, 13=Adar II)
const HEBREW_MONTHS: Record<number, string> = {
  1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול',
  7: 'תשרי', 8: 'חשוון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר', 13: 'אדר ב׳',
};

// Hebrew day labels (gematria style for 1-30)
const HEBREW_DAYS = [
  'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳',
  'י״א', 'י״ב', 'י״ג', 'י״ד', 'ט״ו', 'ט״ז', 'י״ז', 'י״ח', 'י״ט', 'כ׳',
  'כ״א', 'כ״ב', 'כ״ג', 'כ״ד', 'כ״ה', 'כ״ו', 'כ״ז', 'כ״ח', 'כ״ט', 'ל׳',
];

@Injectable({ providedIn: 'root' })
export class HebrewDateService {

  toHebrewDate(date: Date): { dayLabel: string; fullLabel: string; monthName: string } {
    const hd = new HDate(date);
    const day = hd.getDate();
    const month = hd.getMonth();
    const year = hd.getFullYear();

    const monthName = HEBREW_MONTHS[month] ?? String(month);
    const dayLabel = HEBREW_DAYS[day - 1] ?? String(day);
    const yearHe = this.toGematriya(year);

    return {
      dayLabel,
      monthName,
      fullLabel: `${dayLabel} ${monthName} ${yearHe}`,
    };
  }

  getHebrewMonthTitle(date: Date): string {
    const first = new HDate(new Date(date.getFullYear(), date.getMonth(), 1));
    const last = new HDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));

    const m1 = HEBREW_MONTHS[first.getMonth()] ?? '';
    const m2 = HEBREW_MONTHS[last.getMonth()] ?? '';
    const year = this.toGematriya(last.getFullYear());

    return m1 === m2 ? `${m1} ${year}` : `${m1} – ${m2} ${year}`;
  }

  private toGematriya(year: number): string {
    // Strip thousands prefix (e.g. 5784 → 784)
    const y = year % 1000;
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

    const h = Math.floor(y / 100);
    const t = Math.floor((y % 100) / 10);
    const u = y % 10;

    // Special cases: 15=ט"ו, 16=ט"ז (avoid writing God's name)
    let result = hundreds[h];
    if (t === 1 && u === 5) {
      result += 'ט״ו';
    } else if (t === 1 && u === 6) {
      result += 'ט״ז';
    } else {
      result += tens[t] + units[u];
    }

    // Insert geresh/gershayim
    if (result.length === 1) return result + '׳';
    return result.slice(0, -1) + '״' + result.slice(-1);
  }
}
