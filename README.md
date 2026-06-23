# מערכת ניהול תורים — Scheduler

מערכת לניהול תורים ולקוחות עם לוח חודשי הכולל תאריכים עבריים ולועזיים.

## ארכיטקטורה

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | Angular 19 + Signals |
| Backend | NestJS 11 |
| DB | MongoDB + Mongoose |
| עיצוב | Cartoon / Sketch / Clean / Green |
| אחסון מקומי | IndexedDB (פרטי לקוח) |
| PWA | Service Worker + Web Manifest |

---

## הפעלה מהירה

### דרישות מוקדמות
- Node.js 18+
- MongoDB פעיל על `localhost:27017`

### Backend
```bash
cd backend
cp .env.example .env
npm run start:dev
# רץ על http://localhost:3000
```

### Frontend
```bash
cd scheduler-frontend
npm install
npm start
# רץ על http://localhost:4200
```

### כתובת הגישה
כל אדמין מקבל URL ייחודי:
```
http://localhost:4200/:adminId
```
לקוחות מגיעים לאותה כתובת ורואים את לוח השנה של אותו עסק.

---

## מדריך שימוש — צד לקוח (Frontend)

### הרשמה ראשונה
1. היכנס לכתובת העסק שקיבלת
2. בפעם הראשונה תתבקש למלא **שם מלא** ו**טלפון** (אופציונלי: אימייל)
3. הפרטים נשמרים **מקומית על המכשיר שלך בלבד** — לא מועלים לשרת

### קביעת תור
1. **לחץ על יום** בלוח החודשי
2. בפאנל הימני תופיע רשימת שעות פנויות לאותו יום
3. **בחר שעה** מהרשימה
4. מלא את **סוג השירות** (חובה)
5. לחץ **✅ שמור**

> ניתן לקבוע עד **2 תורים פעילים** בו-זמנית.

### ניווט בלוח
- חצים **‹ ›** בכותרת — מעבר בין חודשים
- לחיצה על **שם החודש/שנה** — פותח מיני-לוח לקפיצה מהירה לתאריך
- ימים עם תורים מסומנים בנקודות צבעוניות

### עריכה ומחיקה
- לחץ על תור קיים בפאנל הימני כדי לפתוח את הטופס לעריכה
- לחץ **🗑 מחק** ואשר את המחיקה

### התראות תזכורת (Browser Notifications)
בעת כניסה לאפליקציה תתבקש לאשר קבלת התראות.  
לאחר אישור, תקבל התראת דפדפן אוטומטית:
- **שעה לפני** התור
- **חצי שעה לפני** התור
- **15 דקות לפני** התור

### שפה וערכת נושא
- כפתור **EN / עב** בכותרת — החלפה בין עברית לאנגלית
- כפתור עיפרון בכותרת — בחירת ערכת עיצוב:
  - ✏️ קריקטורה (ברירת מחדל)
  - 🎯 נקי
  - 🌿 ירוק

---

## מדריך שימוש — צד אדמין

### הגדרות עסק
ניהול דרך ה-API:
```
PATCH /:adminId/settings
```
שדות ניתנים לשינוי:
- `businessName` — שם העסק (מוצג בכותרת)
- `workingDays` — ימי עבודה (מערך: 0=ראשון … 6=שבת)
- `startTime` / `endTime` — שעות פעילות `"HH:mm"`
- `breakStart` / `breakEnd` — הפסקה `"HH:mm"`
- `slotDuration` — אורך כל חריץ זמן (דקות)
- `popupMessage` — הודעה שתוצג ללקוחות בכניסה

### ניהול תורים
ניתן לעדכן סטטוס תור: `pending` → `confirmed` → `completed` / `cancelled`

---

## API Endpoints

### אדמין
| Method | URL | תיאור |
|--------|-----|--------|
| GET | `/:adminId/check` | בדיקת קיום אדמין |
| GET/PATCH | `/:adminId/settings` | קריאה/עדכון הגדרות עסק |

### תורים
| Method | URL | תיאור |
|--------|-----|--------|
| GET | `/:adminId/appointments` | כל התורים |
| GET | `/:adminId/appointments?date=YYYY-MM-DD` | תורים לפי תאריך |
| POST | `/:adminId/appointments` | יצירת תור |
| PATCH | `/:adminId/appointments/:id` | עדכון תור |
| DELETE | `/:adminId/appointments/:id` | מחיקת תור |

### לקוחות
| Method | URL | תיאור |
|--------|-----|--------|
| GET | `/:adminId/clients` | כל הלקוחות |
| POST | `/:adminId/clients` | יצירת לקוח |
| PATCH | `/:adminId/clients/:id` | עדכון לקוח |
| DELETE | `/:adminId/clients/:id` | מחיקת לקוח |

---

## מבנה הפרויקט

```
scadualtor/
├── scheduler-frontend/       # Angular 19
│   └── src/app/
│       ├── core/
│       │   ├── models/           # Appointment, Client, BusinessSettings
│       │   ├── services/
│       │   │   ├── appointments.service.ts
│       │   │   ├── clients.service.ts
│       │   │   ├── settings.service.ts
│       │   │   ├── notification.service.ts   # התראות דפדפן
│       │   │   ├── indexed-db.service.ts     # אחסון מקומי
│       │   │   ├── local-client.service.ts   # זיהוי לקוח מקומי
│       │   │   ├── hebrew-date.service.ts    # המרת תאריך עברי
│       │   │   ├── language.service.ts       # HE / EN
│       │   │   ├── theme.service.ts          # ערכות עיצוב
│       │   │   ├── toast.service.ts          # הודעות קצרות
│       │   │   └── admin-check.service.ts    # בדיקת תקינות adminId
│       │   ├── store/
│       │   │   └── app.store.ts              # Signals store (global state)
│       │   └── i18n/
│       │       └── translations.ts           # מחרוזות HE + EN
│       └── features/
│           ├── calendar/           # לוח חודשי ראשי + פאנל יומי
│           ├── mini-calendar/      # לוח קטן לניווט מהיר
│           ├── appointment-form/   # טופס קביעה/עריכת תור
│           ├── client-registration/ # הרשמת לקוח חדש
│           ├── toast/              # הודעות Toast
│           ├── loader/             # אנימציית טעינה
│           ├── popup-message/      # הודעה מהאדמין
│           └── not-found/          # דף שגיאה — adminId לא קיים
│
└── backend/                  # NestJS 11
    └── src/
        ├── appointments/     # Controller + Service + Schema
        ├── clients/          # Controller + Service + Schema
        └── settings/         # Controller + Service + Schema
```

---

## תכונות עיקריות

| תכונה | פרטים |
|-------|--------|
| לוח עברי + לועזי | כל תא מציג שני תאריכים במקביל |
| ריבוי עסקים | כל `adminId` מנהל יומן עצמאי |
| זיהוי לקוח | IndexedDB — ללא התחברות, ללא סיסמה |
| PWA | ניתן להתקנה על מסך הבית במובייל |
| התראות דפדפן | תזכורות אוטומטיות לתורים קרובים |
| ניווט מהיר | מיני-לוח לקפיצה לכל חודש/שנה |
| נגישות | תמיכה ב-RTL, `aria-label`, ניגודיות גבוהה |
| עיצוב | 3 ערכות נושא + מצב סקיצה/קריקטורה |
