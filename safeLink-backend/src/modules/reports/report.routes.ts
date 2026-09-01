//קובץ נתיבים לניהול דיווחים. הוא מיישם אבטחה באמצעות authenticateJWT על כלל הפעולות
//, ומשלב את upload.single('screenshot') עבור נתיב יצירת הדיווח כדי לאפשר העלאת תמונה אחת.


import { Router } from 'express';
import { createReport, getAllReports, updateReportStatus } from './report.controller.js';
import { authenticateJWT } from '../../middleware/auth.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
// יצירת מופע של Router לניהול הנתיבים הקשורים לדיווחים
const router = Router();
// הגדרת הנתיבים עבור פעולות הדיווח, כולל אבטחה והעלאת קבצים
router.post('/', authenticateJWT, upload.single('screenshot'), createReport);
// הגדרת הנתיב לשליפת כל הדיווחים, עם אבטחה באמצעות authenticateJWT
router.get('/', authenticateJWT, getAllReports);
// הגדרת הנתיב לעדכון סטטוס הדיווח לפי מזהה, עם אבטחה באמצעות authenticateJWT
router.patch('/:id/status', authenticateJWT, updateReportStatus);
// ייצוא ה-Router לשימוש במקומות אחרים בקוד
export default router;