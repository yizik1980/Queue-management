export type Lang = 'he' | 'en';

export interface Translations {
  dir: 'rtl' | 'ltr';
  tips?: { icon: string; text: string }[];
  // Header
  appTitle: string;
  newAppointmentBtn: string;
  themeSketch: string;
  themeClean: string;
  themeGreen: string;
  loading: string;
  langToggle: string;

  // Calendar arrays
  months: string[];
  weekDays: string[];
  dayNames: string[];

  // Today label
  formatTodayLabel: (dayName: string, day: number, monthName: string) => string;

  // Mobile
  noWorkingHours: string;
  free: string;

  // Appointment form
  editTitle: string;
  newTitle: string;
  limitTitle: string;
  limitBody: string;
  clientLabel: string;
  youBadge: string;
  selectClient: string;
  noClients: string;
  dateLabel: string;
  timeLabel: string;
  closedDayText: (dayName: string) => string;
  noAvailability: string;
  selectedTimePrefix: string;
  serviceLabel: string;
  servicePlaceholder: string;
  statusLabel: string;
  colorLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  deletingText: string;
  deleteBtn: string;
  cancelBtn: string;
  savingText: string;
  updateBtn: string;
  saveBtn: string;
  deleteConfirm: string;
  statusPending: string;
  statusConfirmed: string;
  statusCancelled: string;
  statusCompleted: string;

  // Help / instructions
  howToBtn: string;
  howToMessage: string[];

  // Client registration
  welcomeTitle: string;
  welcomeSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailOptional: string;
  privacyNote: string;
  appointmentLimit: string;
  registrationError: string;
  registeringText: string;
  registerBtn: string;
}

export const HE: Translations = {
  dir: 'rtl',
  appTitle: 'יומן תורים',
  newAppointmentBtn: '➕ תור חדש',
  themeSketch: '✏️ קריקטורה',
  themeClean:  '🎯 נקי',
  themeGreen:  '🌿 ירוק',
  loading: 'טוען...',
  langToggle: 'EN',

  months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
  weekDays: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'],
  dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  formatTodayLabel: (d, n, m) => `יום ${d}, ${n} ב${m}`,

  noWorkingHours: 'אין שעות עבודה להיום',
  free: 'פנוי',

  editTitle: '✏️ עריכת תור',
  newTitle: '➕ תור חדש',
  limitTitle: 'הגעת למגבלת 2 תורים פעילים',
  limitBody: 'בטל תור קיים כדי לקבוע תור חדש.',
  clientLabel: '👤 לקוח *',
  youBadge: 'אתה',
  selectClient: '-- בחר לקוח --',
  noClients: 'אין לקוחות עדיין.',
  dateLabel: '📅 תאריך *',
  timeLabel: '⏰ בחירת שעה *',
  closedDayText: d => `🚫 יום ${d} — לא יום עבודה`,
  noAvailability: '😔 אין זמינות ביום זה',
  selectedTimePrefix: 'נבחרה שעה',
  serviceLabel: '🔹 שירות *',
  servicePlaceholder: 'תיאור קצר של השירות',
  statusLabel: '📌 סטטוס',
  colorLabel: '🎨 צבע',
  notesLabel: '📝 הערות',
  notesPlaceholder: 'הערות נוספות...',
  deletingText: 'מוחק...',
  deleteBtn: '🗑 מחק',
  cancelBtn: 'ביטול',
  savingText: 'שומר...',
  updateBtn: '💾 עדכן',
  saveBtn: '✅ שמור',
  deleteConfirm: 'למחוק את התור?',
  statusPending: 'ממתין לאישור',
  statusConfirmed: 'מאושר',
  statusCancelled: 'בוטל',
  statusCompleted: 'הושלם',

  howToBtn: 'הוראות',
  howToMessage:[
    '📋 איך לקבוע תור?\n\n' ,
    '1️⃣  לחץ על יום בלוח השנה\n' ,
    '2️⃣  בחר שעה פנויה מהרשימה\n' ,
    '3️⃣  מלא את סוג השירות\n' ,
    '4️⃣  לחץ ✅ שמור\n\n' ,
    '💡 תוכל לקבוע עד 2 תורים פעילים בו-זמנית.'],
  welcomeTitle: 'ברוך הבא!',
  welcomeSubtitle: 'הרשמה מהירה לקביעת תורים',
  fullNameLabel: '👤 שם מלא *',
  fullNamePlaceholder: 'ישראל ישראלי',
  phoneLabel: '📞 טלפון *',
  phonePlaceholder: '050-0000000',
  emailLabel: '✉️ אימייל',
  emailOptional: '(אופציונלי)',
  privacyNote: 'הפרטים שלך נשמרים <strong>מקומית</strong> על המכשיר שלך בלבד.',
  appointmentLimit: 'תוכל לקבוע עד <strong>2 תורים</strong> פעילים.',
  registrationError: 'שגיאה בהרשמה — בדוק חיבור לשרת ונסה שנית.',
  registeringText: '⏳ רושם...',
  registerBtn: '✅ הרשמה וקביעת תור',
   tips: [
    { icon: '📅', text: 'לחץ על יום בלוח — כל ריבוע הוא הזמנה שמחכה לך' }
  ]
};

export const EN: Translations = {
  dir: 'ltr',
  appTitle: 'Appointments',
  newAppointmentBtn: '➕ New',
  themeSketch: '✏️ Sketch',
  themeClean:  '🎯 Clean',
  themeGreen:  '🌿 Green',
  loading: 'Loading...',
  langToggle: 'עב',

  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  formatTodayLabel: (d, n, m) => `${d}, ${m} ${n}`,

  noWorkingHours: 'No working hours today',
  free: 'Free',

  editTitle: '✏️ Edit Appointment',
  newTitle: '➕ New Appointment',
  limitTitle: "Reached the 2 active appointments limit",
  limitBody: 'Cancel an existing appointment to book a new one.',
  clientLabel: '👤 Client *',
  youBadge: 'You',
  selectClient: '-- Select client --',
  noClients: 'No clients yet.',
  dateLabel: '📅 Date *',
  timeLabel: '⏰ Select Time *',
  closedDayText: d => `🚫 ${d} — Not a working day`,
  noAvailability: '😔 No availability on this day',
  selectedTimePrefix: 'Selected time',
  serviceLabel: '🔹 Service *',
  servicePlaceholder: 'Brief service description',
  statusLabel: '📌 Status',
  colorLabel: '🎨 Color',
  notesLabel: '📝 Notes',
  notesPlaceholder: 'Additional notes...',
  deletingText: 'Deleting...',
  deleteBtn: '🗑 Delete',
  cancelBtn: 'Cancel',
  savingText: 'Saving...',
  updateBtn: '💾 Update',
  saveBtn: '✅ Save',
  deleteConfirm: 'Delete this appointment?',
  statusPending: 'Pending',
  statusConfirmed: 'Confirmed',
  statusCancelled: 'Cancelled',
  statusCompleted: 'Completed',

  howToBtn: '?',
  howToMessage:[
    '📋 How to book an appointment?\n\n' ,
    '1️⃣  Click on a day in the calendar\n' ,
    '2️⃣  Choose an available time slot\n' ,
    '3️⃣  Fill in the service type\n' ,
    '4️⃣  Click ✅ Save\n\n' ,
    '💡 You can have up to 2 active appointments at a time.'],

  welcomeTitle: 'Welcome!',
  welcomeSubtitle: 'Quick registration to book appointments',
  fullNameLabel: '👤 Full Name *',
  fullNamePlaceholder: 'John Doe',
  phoneLabel: '📞 Phone *',
  phonePlaceholder: '000-0000000',
  emailLabel: '✉️ Email',
  emailOptional: '(optional)',
  privacyNote: 'Your details are saved <strong>locally</strong> on your device only.',
  appointmentLimit: 'You can book up to <strong>2</strong> active appointments.',
  registrationError: 'Registration error — check your connection and try again.',
  registeringText: '⏳ Registering...',
  registerBtn: '✅ Register & Book',
    tips: [
    { icon: '📅', text: 'Tap any day on the calendar — each square is an invitation' }  ]
};

export const TRANSLATIONS: Record<Lang, Translations> = { he: HE, en: EN };
