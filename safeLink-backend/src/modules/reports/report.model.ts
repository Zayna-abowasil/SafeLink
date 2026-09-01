//קובץ זה מגדיר את המבנה של דיווח על קישור מסוכן, כולל קישור למודלים של סריקה ומשתמש, 
// הגבלת סיבות הדיווח והסטטוסים.




import { Schema, model, Document, Types } from 'mongoose';
// ממשק TypeScript שמייצג את מבנה מסמך הדיווח במסד הנתונים
export interface IReport extends Document {
  scanId: Types.ObjectId;
  userId: Types.ObjectId;
  reason: 'Phishing' | 'Malware' | 'Inappropriate content';
  comments?: string;
  screenshotUrl?: string;
  status: 'Under Review' | 'Resolved';
  reportDate: Date;
}
// הגדרת ה-Schema של הדיווח עם סוגי השדות והגבלות
const ReportSchema = new Schema<IReport>({
  // הגדרת שדה scanId שמקשר למודל Scan ומחייב את קיומו
  scanId: { type: Schema.Types.ObjectId, ref: 'Scan', required: true },
  // הגדרת שדה userId שמקשר למודל User ומחייב את קיומו
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // הגדרת שדה reason שמקבל רק ערכים מוגדרים מראש ומחייב את קיומו
  reason: { 
    type: String, 
    enum: ['Phishing', 'Malware', 'Inappropriate content'], 
    required: true 
  },
  // הגדרת שדה comments שמקבל מחרוזת אופציונלית
  comments: { type: String },
  // הגדרת שדה screenshotUrl שמקבל מחרוזת אופציונלית
  screenshotUrl: { type: String },
  // הגדרת שדה status שמקבל רק ערכים מוגדרים מראש ומקבל ערך ברירת מחדל
  status: { 
    type: String, 
    enum: ['Under Review', 'Resolved'], 
    default: 'Under Review' 
  },
  // הגדרת שדה reportDate שמקבל תאריך ומקבל ערך ברירת מחדל של התאריך הנוכחי
  reportDate: { type: Date, default: Date.now }
});
// יצירת המודל של הדיווח על בסיס ה-Schema שהוגדר, ומיוצא לשימוש במקומות אחרים בקוד
export const Report = model<IReport>('Report', ReportSchema);