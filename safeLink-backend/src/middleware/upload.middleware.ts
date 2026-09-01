
//קובץ זה מגדיר Middleware באמצעות ספריית Multer לטיפול בהעלאת קבצים .
//  הוא משתמש באחסון בזיכרון (Memory Storage), 
//כך שהקובץ נשמר כ-Buffer ב-RAM ואינו נכתב לדיסק הקשיח,
//  דבר שמתאים להעלאה מיידית ל-Cloudinary

import multer from 'multer';
// הגדרת אחסון בזיכרון (Memory Storage) עבור Multer
const storage = multer.memoryStorage();
// יצוא של Middleware להעלאת קבצים, המוגדר עם האחסון בזיכרון
export const upload = multer({ storage: storage });