//קובץ בקר המנהל את מערך דיווחי האיומים (Reports). 
// הוא מאפשר יצירת דיווח עם תמיכה בהעלאת צילום מסך ל-Cloudinary,
//  שליפת כל הדיווחים יחד עם פרטי המשתמש והסריקה (populate), 
// ועדכון סטטוס הדיווח.




import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Report } from './report.model.js';
import cloudinary from '../../config/cloudinary.js';
import mongoose from 'mongoose';
// פונקציה ליצירת דיווח חדש
export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        // חילוץ פרטי הדיווח מהבקשה
        const { scanId, reason, comments } = req.body;
        // חילוץ מזהה המשתמש מהבקשה המאומתת
        const userId = req.user?.userId;
        // משתנה לאחסון כתובת ה-URL של צילום המסך אם הועלה
        let screenshotUrl = '';
        // 1. בדיקה אם קובץ צילום מסך הועלה והעלאתו ל-Cloudinary
        if (req.file) {
            // המרת הקובץ ל-Base64 כדי להעלותו ל-Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            // יצירת Data URI עבור הקובץ
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            // העלאת הקובץ ל-Cloudinary בתיקייה SafeLinkReports
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: 'SafeLinkReports',
            });
            // שמירת כתובת ה-URL של צילום המסך שהועלה
            screenshotUrl = uploadResult.secure_url;
        }
         // 2. יצירת מזהי MongoDB תקינים עבור הסריקה והמשתמש
        const validScanId = (scanId && mongoose.Types.ObjectId.isValid(scanId))
            ? new mongoose.Types.ObjectId(scanId)
            : new mongoose.Types.ObjectId();
        // יצירת מזהה MongoDB תקין עבור המשתמש, או יצירת מזהה חדש אם לא קיים
        const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId))
            ? new mongoose.Types.ObjectId(userId)
            : new mongoose.Types.ObjectId();
        // 3. יצירת הדיווח במסד הנתונים עם הפרטים שהתקבלו
        const newReport = await Report.create({
            scanId: validScanId,
            userId: validUserId,
            reason: reason || 'Phishing',
            comments: comments || '',
            screenshotUrl: screenshotUrl || undefined,
            status: 'Under Review',
        });
        // החזרת תשובה עם סטטוס 201 והודעה על הצלחת יצירת הדיווח, כולל פרטי הדיווח החדש
        res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport
        });
        // במקרה של שגיאה במהלך יצירת הדיווח, החזרת שגיאה 500 עם הודעה מתאימה
    } catch (error: any) {
        console.error('Report Creation Error:', error);
        res.status(500).json({ 
            message: error?.message || 'Failed to submit report', 
            error 
        });
    }
};
// פונקציה לשליפת כל הדיווחים מהמסד הנתונים
export const getAllReports = async (req: AuthRequest, res: Response) => {
    try {
        // שליפת כל הדיווחים מהמסד הנתונים עם פרטי הסריקה והמשתמש (populate) ומיון לפי תאריך הדיווח בסדר יורד
        const reports = await Report.find()
          .populate('scanId', 'url riskScore classification')
          .populate('userId', 'name email role')
          .sort({ reportDate: -1 });
        // החזרת תשובה עם סטטוס 200, מספר הדיווחים והדיווחים עצמם
        res.status(200).json({ count: reports.length, reports });
    } catch (error) {
        // במקרה של שגיאה במהלך שליפת הדיווחים, החזרת שגיאה 500 עם הודעה מתאימה
        res.status(500).json({ message: 'Failed to retrieve reports', error });
    }
};
// פונקציה לעדכון סטטוס של דיווח קיים
export const updateReportStatus = async (req: AuthRequest, res: Response) => {
    try {
        // חילוץ מזהה הדיווח והסטטוס החדש מהבקשה
        const { id } = req.params;
        // חילוץ הסטטוס החדש מהגוף של הבקשה
        const { status } = req.body;
        // בדיקה אם הסטטוס החדש הוא אחד מהסטטוסים המותרים
        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        // אם הדיווח לא נמצא, החזרת שגיאה 404 עם הודעה מתאימה
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        // החזרת תשובה עם סטטוס 200 והודעה על הצלחת עדכון הסטטוס, כולל פרטי הדיווח המעודכנים
        res.status(200).json({ message: 'Report status updated', report });
    } catch (error) {
        // במקרה של שגיאה במהלך עדכון הסטטוס, החזרת שגיאה 500 עם הודעה מתאימה
        res.status(500).json({ message: 'Failed to update report status', error });
    }
};