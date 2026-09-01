//קובץ נתיבים (Router) המקשר בין כתובות ה-HTTP מסוג POST
//עבור /register ו-/login לבין הפונקציות המתאימות ב-Controller

import{Router} from 'express';
import { register, login} from './auth.controller.js';
// יצירת מופע של Router לניהול הנתיבים הקשורים לאימות משתמשים
const router = Router();
// הגדרת הנתיבים עבור פעולות ההרשמה וההתחברות
router.post('/register', register);
router.post('/login', login);
// ייצוא ה-Router לשימוש במקומות אחרים בקוד
export default router;