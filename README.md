# מערכת ניהול תורים - Scheduler

מערכת לניהול תורים ולקוחות עם לוח חודשי הכולל תאריכים עבריים ולועזיים.

## ארכיטקטורה

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | Angular 19 + Signals |
| Backend | NestJS 11 |
| DB | MongoDB + Mongoose |
| עיצוב | Cartoon/Sketch Style |

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
cd frontend
npm start
# רץ על http://localhost:4200
```

## API Endpoints

| Method | URL | תיאור |
|--------|-----|--------|
| GET | /api/appointments | כל התורים |
| GET | /api/appointments?date=YYYY-MM-DD | תורים לפי תאריך |
| POST | /api/appointments | יצירת תור |
| PATCH | /api/appointments/:id | עדכון תור |
| DELETE | /api/appointments/:id | מחיקת תור |
| GET | /api/clients | כל הלקוחות |
| POST | /api/clients | יצירת לקוח |
| PATCH | /api/clients/:id | עדכון לקוח |
| DELETE | /api/clients/:id | מחיקת לקוח |

## מבנה הפרויקט

```
scadualtor/
├── frontend/       # Angular 19
│   └── src/app/
│       ├── core/
│       │   ├── models/       # Appointment, Client
│       │   ├── services/     # HTTP + Hebrew date
│       │   └── store/        # Signals store
│       └── features/
│           ├── calendar/     # לוח חודשי
│           ├── appointment-form/  # טופס תור
│           └── clients/      # ניהול לקוחות
│
└── backend/        # NestJS 11
    └── src/
        ├── appointments/     # Controller + Service + Schema
        └── clients/          # Controller + Service + Schema
```
