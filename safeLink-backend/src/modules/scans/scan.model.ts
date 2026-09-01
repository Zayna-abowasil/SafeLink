//מגדיר את מודל וסכמת הסריקה (Scan) ב-Mongoose. 
// שומר את פרטי הקישור שנבדק, ציון הסיכון (0-100), סיווג הבטיחות ('Safe', 'Suspicious', 'Malicious'), 
// מערך אינדיקטורים לזיהוי האיום, והסבר מילולי מהבינה המלאכותית


import { Schema, model, Document, Types } from 'mongoose';
// ממשק TypeScript שמייצג את מבנה מסמך הסריקה במסד הנתונים
export interface IScan extends Document {
  userId: Types.ObjectId;
  url: string;
  riskScore: number;
  classification: 'Safe' | 'Suspicious' | 'Malicious';
  threatIndicators: string[];
  aiExplanation: string;
  status: 'Completed' | 'Under Review';
  scanDate: Date;
}
// הגדרת ה-Schema של הסריקה עם סוגי השדות והגבלות
const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  riskScore: { type: Number, required: true },
  classification: { 
    type: String, 
    enum: ['Safe', 'Suspicious', 'Malicious'], 
    required: true 
  },
  threatIndicators: [{ type: String }],
  aiExplanation: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Completed', 'Under Review'], 
    default: 'Completed' 
  },
  scanDate: { type: Date, default: Date.now }
});
// יצירת המודל של הסריקה על בסיס ה-Schema שהוגדר, ומיוצא לשימוש במקומות אחרים בקוד
export const Scan = model<IScan>('Scan', ScanSchema);