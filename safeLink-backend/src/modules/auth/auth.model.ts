//קובץ זה מגדיר את ה-Schema והמודל של משתמש ב-MongoDB באמצעות Mongoose ו-TypeScript.
//  הוא מגדיר את סוגי השדות (שם, אימייל ייחודי, סיסמה מוצפנת, תפקיד ותאריך יצירה).


import { Schema, model, Document } from 'mongoose';
// ממשק TypeScript שמייצג את מבנה מסמך המשתמש במסד הנתונים
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'admin';
    createdAt: Date;
}
// הגדרת ה-Schema של המשתמש עם סוגי השדות והגבלות
const UserSchema = new Schema<IUser>({
    name: { type: String, required: true},
    email: {type: String,required: true,unique: true},
    passwordHash: {type: String,required: true},
    role: {type: String,enum: ['user', 'admin'],default: 'user'},
    createdAt: {type: Date,default: Date.now}
});
// יצירת המודל של המשתמש על בסיס ה-Schema שהוגדר, ומיוצא לשימוש במקומות אחרים בקוד
export const User = model<IUser>('User', UserSchema);