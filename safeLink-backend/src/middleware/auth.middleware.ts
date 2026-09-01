//זה מגדיר Middleware לאימות משתמשים (Authentication) באמצעות אסימוני JWT.
//הוא בודק אם הבקשה מכילה כותרת Authorization עם Bearer Token תקין
//מפענח את הנתונים, מוסיף את פרטי המשתמש לאובייקט הבקשה (req.user), 
//ומאפשר לבקשה להמשיך או חוסם אותה במקרה של טוקן שגוי/פג תוקף.




import {Request, Response, NextFunction} from 'express';
import jwt from  'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { userId: string; role: string;};
}
// פונקציה Middleware לאימות JWT
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {    const authHeader = req.headers.authorization;
    // בדיקה אם הכותרת Authorization קיימת ומתחילה ב-Bearer
    if (!authHeader|| !authHeader.startsWith('Bearer ')) {
        // החזרת שגיאה אם אין כותרת Authorization או אם היא לא מתחילה ב-Bearer
        return res.status(401).json({message: 'Access denied. No token provided.'});
    }
    //מחלץ את מחרוזת הטוקן בלבד ללא המילה 'Bearer'.
    const token = authHeader.split(' ')[1];
    try{
        // מפענח את הטוקן באמצעות המפתח הסודי שנשמר במשתני הסביבה
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
            userId: string;
            role: string;
        };
        // מוסיף את פרטי המשתמש לאובייקט הבקשה כדי שניתן יהיה להשתמש בהם בהמשך
        req.user = decoded;
        // מאפשר לבקשה להמשיך ל-Middleware או ל-Route Handler הבא
        next();
        // במקרה של טוקן שגוי או פג תוקף, מחזיר שגיאה 403
    }catch (error) {
        return res.status(403).json({message: 'Invalid or expired token.'});
    }
};