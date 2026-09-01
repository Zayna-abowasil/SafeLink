//זה אחראי על אתחול והגדרת ספריית 
// Cloudinary בצד השרת (Node.js). 
// המטרה היא לקשר את האפליקציה לשירות האחסון בענן להעלאת תמונות וקבצי מדיה בצורה מאובטחת,
//  תוך שימוש במפתחות גישה הנמשכים ממשתני סביבה 
// (.env).


import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;