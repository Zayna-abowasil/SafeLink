//זה מנהל את החיבור למסד הנתונים MongoDB באמצעות ספריית Mongoose ב-TypeScript.
//  הוא מייצא פונקציה אסינכרונית שמנסה להתחבר ומדפיסה הודעת הצלחה עם פרטי השרת,
//  או תופסת שגיאות וסוגרת את תהליך השרת לחלוטין אם החיבור נכשל.


import mongoose from 'mongoose';
// פונקציה אסינכרונית שמתחברת למסד הנתונים MongoDB באמצעות Mongoose
export const connectDB = async (): Promise<void> => {
  try {
    // התחברות למסד הנתונים באמצעות כתובת ה-URI שנשמרה במשתני הסביבה
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    // הדפסת הודעת הצלחה עם פרטי השרת
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    // סגירת תהליך השרת אם החיבור נכשל  
    process.exit(1);
  }
};