//קובץ הגדרות בצד הלקוח (Client/Mobile). 
// הוא מגדיר את כתובת ה-IP המקומית של ה-API ופונקציית עזר בשם customFetch שמצרפת כותרות ברירת מחדל לכל פנייה.


// כתובת ה-IP המקומית של שרת ה-API.
export const API_BASE_URL = 'http://192.168.1.35:5000/api';
// פונקציה שמבצעת בקשת Fetch לשרת ה-API עם כותרות ברירת מחדל
export const customFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'bypass-tunnel-reminder': 'true',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};