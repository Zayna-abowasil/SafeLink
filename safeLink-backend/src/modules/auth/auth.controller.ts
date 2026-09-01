//קובץ בקר (Controller) המנהל את פעולות ההרשמה וההתחברות
// . הוא מכיל פונקציה להרשמת משתמש חדש עם הצפנת סיסמה באמצעות bcrypt, 
// ופונקציית התחברות הבודקת את נכונות הפרטים ומנפיקה אסימון JWT 





import { Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';
// פונקציה לרישום משתמש חדש
export const register = async (req: Request, res: Response) =>{
    try{
        // חילוץ פרטי המשתמש מהבקשה
        const { name, email, password, role} = req.body;
        // בדיקה אם המשתמש כבר קיים במסד הנתונים לפי כתובת האימייל
        const existingUser = await User.findOne({email});
        // אם המשתמש כבר קיים, מחזיר שגיאה 400 עם הודעה מתאימה
        if(existingUser){
            return res.status(400).json({message: 'Email already in use.'});
        }
         // יצירת Salt והצפנת הסיסמה באמצעות bcrypt
        const salt = await bcrypt.genSalt(10);
        // הצפנת הסיסמה עם ה-Salt שנוצר
        const passwordHash = await bcrypt.hash(password, salt);
        // יצירת משתמש חדש במסד הנתונים עם הפרטים שהתקבלו והסיסמה המוצפנת
        const newUser = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'user'
        });
        // החזרת תשובה עם סטטוס 201 והודעה על הצלחת ההרשמה, כולל מזהה המשתמש החדש
        res.status(201).json({message: 'User registered successfully.', userID: newUser._id});
    } catch (error) {
        // החזרת שגיאה 500 עם הודעה מתאימה במקרה של כישלון בהרשמה
        res.status(500).json({message: 'Registration failed', error});
    }
};
// פונקציה להתחברות של משתמש קיים
export const login = async (req: Request, res: Response) =>{
    try{
        const { email, password} = req.body;
        // חיפוש המשתמש במסד הנתונים לפי כתובת האימייל  
        const user = await User.findOne({email});
        if(!user){
            // החזרת שגיאה 400 עם הודעה על פרטי התחברות שגויים אם המשתמש לא נמצא    
            return res.status(400).json({message: 'Invalid email or password.'}); 
        }
         // בדיקה אם הסיסמה שהוזנה תואמת לסיסמה המוצפנת במסד הנתונים
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            // החזרת שגיאה 400 עם הודעה על פרטי התחברות שגויים אם הסיסמה לא תואמת
            return res.status(400).json({message: 'Invalid email or password.'});
        }
        // יצירת אסימון JWT עם מזהה המשתמש ותפקידו, בתוקף של 7 ימים
        const token = jwt.sign(
            {userId: user._id, role: user.role},
            process.env.JWT_SECRET || 'fallback_secret',
            {expiresIn: '7d'}
        );
        // החזרת תשובה עם סטטוס 200, הודעה על הצלחת ההתחברות, האסימון שנוצר ופרטי המשתמש
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }catch (error) {
        // החזרת שגיאה 500 עם הודעה מתאימה במקרה של כישלון בהתחברות
        res.status(500).json({message: 'Login failed', error});
    }
};
        