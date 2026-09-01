//מגדיר את נתיבי ה-API עבור פעולות הסריקה ומאבטח את כולם בעזרת authenticateJWT.



import { Router } from 'express';
import { submitScan, getScanHistory, deleteScan } from './scan.controller.js';
import { authenticateJWT } from '../../middleware/auth.middleware.js';
// יצירת מופע של Router לניהול הנתיבים הקשורים לסריקות
const router = Router();
//שליחת קישור חדש לסריקה.
router.post('/', authenticateJWT, submitScan);
//צפייה בהיסטוריית הסריקות.
router.get('/history', authenticateJWT, getScanHistory);
//מחיקת רשומת סריקה לפי מזהה
router.delete('/:id', authenticateJWT, deleteScan);
// ייצוא ה-Router לשימוש במקומות אחרים בקוד
export default router;