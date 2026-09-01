//שכבת השירות (Service) שמבצעת את ניתוח האבטחה של הקישורים בעזרת מודל ה-AI של OpenAI. 
//השירות כולל מנגנון Fallback / Mock לבדיקה מקומית (heuristic check) 
// המזהה מילות מפתח חשודות במקרה שאין מפתח API
//  תקין או במידה והשירות החיצוני נכשל.


// המטרה היא להבטיח שהמערכת תמשיך לפעול גם ללא תלות בשירות החיצוני
// , תוך מתן הערכה בסיסית של הסיכון הקשור לכתובת ה-URL שנבדקת.
import OpenAI from 'openai';
// יצירת מופע של OpenAI עם מפתח ה-API שנלקח ממשתני הסביבה
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
// פונקציה אסינכרונית שמנתחת כתובת URL בעזרת מודל ה-AI של OpenAI
export const analyzeUrlWithOpenAI = async (url: string) => {
  //בודק קיום מילות מפתח חשודות בקישור
  const isMaliciousMock =
    url.toLowerCase().includes('malware') ||
    url.toLowerCase().includes('phishing') ||
    url.toLowerCase().includes('bad') ||
    url.toLowerCase().includes('login');
  //אם מפתח ה-API חסר או דמה, מחזיר מיידית תוצאת סימולציה מובנית כדי לחסוך פניות ולמנוע שגיאות בפיתוח.
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === 'your_openai_api_key' ||
    process.env.OPENAI_API_KEY === 'dummy_key'
  ) {
    // החזרת תוצאה סימולטיבית (Mock) עם ציון סיכון, סיווג, אינדיקטורים והסבר ה-AI
    return {
      riskScore: isMaliciousMock ? 85 : 12,
      classification: isMaliciousMock ? 'Malicious' : 'Safe',
      threatIndicators: isMaliciousMock
        ? ['Suspicious domain pattern', 'Unverified login portal', 'Potential credential harvesting']
        : ['Valid domain structure', 'No blacklisted patterns detected'],
      aiExplanation: isMaliciousMock
        ? 'Simulated AI Analysis: The URL contains high-risk indicators commonly associated with phishing campaigns.'
        : 'Simulated AI Analysis: The URL shows no immediate threat indicators and appears safe.',
    };
  }
   // אם מפתח ה-API תקין, מבצע ניתוח אמיתי בעזרת OpenAI
  try {
    //שולח Prompt מובנה ל-OpenAI המנחה את המודל (gpt-3.5-turbo) להחזיר תשובה בפורמט JSON בלבד
    const prompt = `Analyze the following URL for cyber security threats (Phishing, Malware, Scam): "${url}".
    Return ONLY a raw JSON object with this exact structure:
    {
      "riskScore": number between 0 and 100,
      "classification": "Safe" or "Suspicious" or "Malicious",
      "threatIndicators": ["indicator1", "indicator2"],
      "aiExplanation": "short summary explaining the verdict"
    }`;
    // שולח את הבקשה ל-OpenAI וממתין לתשובה
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    // חילוץ התוכן מהתשובה של OpenAI
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    // מחזיר את התוכן המנותח כ-JSON
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Error, falling back to heuristic check:', error);
    // במקרה של שגיאה בשירות OpenAI, מבצע בדיקה מקומית (heuristic check) ומחזיר תוצאה סימולטיבית
    return {
      riskScore: isMaliciousMock ? 85 : 15,
      classification: isMaliciousMock ? 'Malicious' : 'Safe',
      threatIndicators: ['Automated heuristic scan fallback'],
      aiExplanation: 'Heuristic evaluation completed successfully.',
    };
  }
};