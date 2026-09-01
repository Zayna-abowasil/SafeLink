//בקר האחראי על תהליך סריקת הקישורים (Scans).
//  הוא מקבל כתובת URL, 
// שולח אותה לניתוח בינה מלאכותית, שומר את תוצאות הסריקה ומדדי הסיכון במסד הנתונים
// , ומספק פונקציות לצפייה בהיסטוריית הסריקות האישית ומחיקת סריקה ספציפית.





import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Scan } from './scan.model.js';
import { analyzeUrlWithOpenAI } from './scan.service.js';
// פונקציה שמטפלת בבקשה לניתוח כתובת URL
export const submitScan = async (req: AuthRequest, res: Response) => {
    try {
        // חילוץ כתובת ה-URL מהבקשה ומזהה המשתמש מהבקשה המאומתת
        const { url } = req.body;
        // חילוץ מזהה המשתמש מהבקשה המאומתת
        const userId = req.user?.userId;
        // בדיקה אם כתובת ה-URL נשלחה בבקשה, ואם לא, החזרת שגיאה 400 עם הודעה מתאימה
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }
        //שומר רשומת סריקה חדשה במסד הנתונים עם תוצאות הניתוח (ציון סיכון, סיווג, אינדיקטורים והסבר ה-AI).
        const aiAnalysis = await analyzeUrlWithOpenAI(url);
        // יצירת רשומת סריקה חדשה במסד הנתונים עם פרטי המשתמש, כתובת ה-URL ותוצאות הניתוח
        const newScan = await Scan.create({
            userId,
            url,
            riskScore: aiAnalysis.riskScore,
            // שמירת הסיווג שה-AI קבע עבור הכתובת
            classification: aiAnalysis.classification,
            // שמירת אינדיקטורים של איומים שה-AI זיהה
            threatIndicators: aiAnalysis.threatIndicators,
            // הסבר של הבינה המלאכותית על הסריקה
            aiExplanation: aiAnalysis.aiExplanation,
            // סטטוס הסריקה מוגדר כברירת מחדל כ-Completed
            status: 'Completed',
        });
        // החזרת תשובה עם סטטוס 201 והודעה על הצלחת הסריקה, כולל פרטי הסריקה החדשה
        res.status(201).json({
            message: 'URL analyzed successfully',
            scan: newScan
        });
        // במקרה של שגיאה במהלך תהליך הסריקה או שמירת הנתונים, החזרת שגיאה 500 עם הודעה מתאימה
    } catch (error) {
        res.status(500).json({ message: 'Scan failed', error });
    }
};
// פונקציה שמטפלת בבקשה לשליפת כל הסריקות של המשתמש
export const getScanHistory = async (req: AuthRequest, res: Response) => {
    try {
        // חילוץ מזהה המשתמש מהבקשה המאומתת
        const userId = req.user?.userId;
        // שליפת כל הסריקות של המשתמש ממסד הנתונים, ממוינות לפי תאריך הסריקה בסדר יורד
        const scans = await Scan.find({ userId }).sort({ scanDate: -1 });
         // החזרת תשובה עם סטטוס 200 והודעה על הצלחת השליפה, כולל מספר הסריקות ופרטי כל סריקה
        res.status(200).json({
            // החזרת מספר הסריקות שנמצאו והסריקות עצמן
            count: scans.length,
            scans
        });
        // במקרה של שגיאה במהלך שליפת ההיסטוריה, החזרת שגיאה 500 עם הודעה מתאימה
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve scan history', error });
    }
};
// פונקציה שמטפלת בבקשה למחיקת סריקה ספציפית של המשתמש
export const deleteScan = async (req: AuthRequest, res: Response) => {
    try {
        // חילוץ מזהה הסריקה מהפרמטרים של הבקשה ומזהה המשתמש מהבקשה המאומתת
        const { id } = req.params;
        // חילוץ מזהה המשתמש מהבקשה המאומתת
        const userId = req.user?.userId;
        // מחיקת הסריקה ממסד הנתונים רק אם היא שייכת למשתמש המבצע את הבקשה
        const scan = await Scan.findOneAndDelete({ _id: id, userId });
        // אם הסריקה לא נמצאה או אינה שייכת למשתמש, החזרת שגיאה 404 עם הודעה מתאימה
        if (!scan) {
            return res.status(404).json({ message: 'Scan not found or unauthorized' });
        }
        // החזרת תשובה עם סטטוס 200 והודעה על הצלחת המחיקה
        res.status(200).json({ message: 'Scan deleted successfully' });
        // במקרה של שגיאה במהלך מחיקת הסריקה, החזרת שגיאה 500 עם הודעה מתאימה
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete scan', error });
    }
};