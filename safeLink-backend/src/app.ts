//נקודת הכניסה המרכזית (Entry Point) של שרת ה-Backend. 
// בקובץ זה מאותחלים משתני הסביבה
// , ה-Middlewares הבסיסיים (CORS ופענוח JSON), 
// החיבור ל-MongoDB, חיבור כלל הנתיבים המאוחדים, והפעלת האזנה לבקשות בפורט הנבחר.


import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/auth.routers.js';
import scanRoutes from './modules/scans/scan.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
// אתחול משתני הסביבה מהקובץ .env
dotenv.config();
// יצירת מופע של אפליקציית Express
const app = express();
//לאישור בקשות חוצות-דומיינים
app.use(cors());
// פענוח בקשות JSON שמגיעות מהלקוח
app.use(express.json());
// ליצירת קשר עם מסד הנתונים
connectDB();

// חיבור כלל הנתיבים המאוחדים של האפליקציה
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/reports', reportRoutes);
//מפעיל את השרת להאזנה על פורט 5000 או הפורט המוגדר בסביבה ומדפיס הודעה לטרמינל
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});