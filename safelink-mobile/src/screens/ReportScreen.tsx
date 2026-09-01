//מסך שליחת דיווח על איומים. מאפשר למשתמש לבחור קישור מתוך רשימת הסריקות שביצע בעבר, 
// להגדיר את מהות האיום, להוסיף הערות חופשיות, ולצרף צילום מסך כראיה ישירות מגלריית המכשיר באמצעות 
// expo-image-picker שנשלח כ-FormData לשרת.


import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

// ממשק TypeScript שמייצג פריט סריקה שנשמר בהיסטוריה
interface ScannedLink {
  // מזהה ייחודי של הסריקה
  _id: string;
  // כתובת ה-URL של הקישור שנסרק
  url: string;
  // ציון הסיכון שהוקצה לקישור על ידי המערכת
  classification: string;
}

// פונקציה React שמייצגת את מסך שליחת הדיווח על איומים
export default function ReportScreen() {
  // הגדרת מצבים (States) לניהול רשימת הסריקות, הסריקה שנבחרה, מצב התפריט הנפתח, מצב טעינה של הסריקות,
  // מצב הסיבה לדיווח, הערות חופשיות, כתובת ה-URI של התמונה שנבחרה, ומצב שליחת הדיווח
  const [scans, setScans] = useState<ScannedLink[]>([]);
  // מצב שמציין את מזהה הסריקה שנבחרה לדיווח
  const [selectedScanId, setSelectedScanId] = useState('');
  // מצב שמציין את כתובת ה-URL של הסריקה שנבחרה לדיווח
  const [selectedScanUrl, setSelectedScanUrl] = useState('');
  // מצב שמציין אם התפריט הנפתח מוצג
  const [showDropdown, setShowDropdown] = useState(false);
  // מצב שמציין אם הנתונים של הסריקות עדיין נטענים מהשרת
  const [loadingScans, setLoadingScans] = useState(true);
  // מצב שמציין את הסיבה לדיווח (Phishing, Malware, או Inappropriate content)
  const [reason, setReason] = useState<'Phishing' | 'Malware' | 'Inappropriate content'>('Phishing');
  // מצב שמציין את ההערות החופשיות שהמשתמש הזין בדיווח
  const [comments, setComments] = useState('');
  // מצב שמציין את כתובת ה-URI של התמונה שנבחרה מהגלריה לצירוף לדיווח
  const [imageUri, setImageUri] = useState<string | null>(null);
  // מצב שמציין אם הבקשה לשליחת הדיווח נמצאת בתהליך שליחה
  const [submitting, setSubmitting] = useState(false);

  // פונקציה אסינכרונית שמושכת את רשימת הסריקות של המשתמש מהשרת
  const fetchScannedLinks = async () => {
    try {
      //שולף את הטוקן המאומת מה-AsyncStorage כדי להשתמש בו בכותרת Authorization של הבקשה לשרת
      const token = await AsyncStorage.getItem('userToken');
      // ביצוע בקשת Fetch לשרת ה-Backend לקבלת רשימת הסריקות של המשתמש, כולל כותרות מתאימות
      const response = await fetch(`${API_BASE_URL}/scans/history`, {
        // הגדרת כותרות הבקשה, כולל Content-Type והוספת Authorization אם הטוקן קיים
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הצליחה, מעדכן את מצב הסריקות עם הנתונים שהתקבלו.
      const data = await response.json();
      // אם הבקשה הצליחה והתקבלו סריקות, מעדכן את מצבי הסריקות, הסריקה שנבחרה וה-URL שלה
      if (response.ok && data.scans) {
        // מעדכן את רשימת הסריקות שהתקבלה מהשרת
        setScans(data.scans);
        // אם קיימות סריקות, בוחר אוטומטית את הסריקה הראשונה ברשימה ומעדכן את מזהה הסריקה וה-URL שלה
        if (data.scans.length > 0) {
          setSelectedScanId(data.scans[0]._id);
          setSelectedScanUrl(data.scans[0].url);
        }
      }
      // אם הבקשה נכשלה, מדפיס הודעת שגיאה לטרמינל.
    } catch (error) {
      console.error('Failed to load scans:', error);
    } finally {
      // בסיום הבקשה, גם אם נכשלה, מעדכן את מצב הטעינה כדי להפסיק את האנימציה של אינדיקטור הטעינה
      setLoadingScans(false);
    }
  };
  
  // שימוש ב-Hook useEffect כדי לקרוא לפונקציה fetchScannedLinks בעת טעינת המסך בפעם הראשונה
  useEffect(() => {
    fetchScannedLinks();
  }, []);
   
  // פונקציה אסינכרונית שמאפשרת למשתמש לבחור תמונה מהגלריה של המכשיר באמצעות expo-image-picker
  const pickImage = async () => {
    // בקשה לקבלת הרשאות גישה לגלריה. אם המשתמש מסרב, מציג הודעת שגיאה ומפסיק את התהליך
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // אם ההרשאה לא ניתנה, מציג הודעת שגיאה למשתמש ומפסיק את התהליך
    if (!permission.granted) {
      // מציג הודעת שגיאה למשתמש במקרה של סירוב הרשאות גישה לגלריה
      Alert.alert('Permission Denied', 'Gallery access is required to upload screenshots.');
      // מפסיק את הפונקציה ומחזיר שליטה למשתמש
      return;
    }
     
    // פתיחת גלריית התמונות של המכשיר כדי לאפשר למשתמש לבחור תמונה.
    //  מוגדרים סוגי המדיה המותרים, אפשרות עריכה ואיכות התמונה
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    // אם המשתמש בחר תמונה ולא ביטל את הבחירה, מעדכן את מצב כתובת ה-URI של התמונה שנבחרה
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // פונקציה אסינכרונית שמטפלת בתהליך שליחת הדיווח לשרת
  const handleReportSubmit = async () => {
    // בדיקה אם המשתמש בחר סריקה לדיווח. אם לא, מציג הודעת שגיאה ומפסיק את התהליך
    if (!selectedScanId) {
      Alert.alert('Validation Error', 'Please select a scanned link to report.');
      return;
    }
     
    setSubmitting(true);
    try {
      //שולף את הטוקן המאומת מה-AsyncStorage כדי להשתמש בו בכותרת Authorization של הבקשה לשרת
      const token = await AsyncStorage.getItem('userToken');
      // יצירת אובייקט FormData כדי לשלוח את פרטי הדיווח, כולל מזהה הסריקה, הסיבה, ההערות החופשיות והתמונה שנבחרה
      const formData = new FormData();
      formData.append('scanId', selectedScanId);
      formData.append('reason', reason);
      formData.append('comments', comments);
       
      // אם המשתמש בחר תמונה, מוסיף את התמונה ל-FormData עם שם קובץ וסוג MIME מתאים
      if (imageUri) {
        // חילוץ שם הקובץ מה-URI של התמונה שנבחרה
        const filename = imageUri.split('/').pop() || 'screenshot.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('screenshot', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }
      // ביצוע בקשת Fetch לשרת ה-Backend לשליחת הדיווח עם פרטי הדיווח שהוזנו על ידי המשתמש
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }
      // אם הבקשה הצליחה, מציג הודעת הצלחה למשתמש ומאפס את שדות הקלט והמצבים הרלוונטיים
      Alert.alert('Report Submitted', 'The threat report has been registered successfully.');
      // איפוס שדות הקלט והמצבים הרלוונטיים לאחר שליחת הדיווח בהצלחה
      setComments('');
      setImageUri(null);
    } catch (error: any) {
      // אם הבקשה נכשלה, מציג הודעת שגיאה למשתמש עם ההודעה שהתקבלה מהשרת או הודעה כללית
      Alert.alert('Error', error.message || 'Unable to submit report.');
    } finally {
      // בסיום הבקשה, גם אם נכשלה, מעדכן את מצב השליחה כדי להפסיק את האנימציה של אינדיקטור הטעינה
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 mr-3">
          <Ionicons name="flag" size={24} color="#fb7185" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-rose-400">Threat Dispatch</Text>
          <Text className="text-xs text-slate-400">Report suspicious links and threats</Text>
        </View>
      </View>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8">
        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Select Scanned Link</Text>
          {loadingScans ? (
            <ActivityIndicator color="#38bdf8" className="py-2" />
          ) : scans.length === 0 ? (
            <View className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <Text className="text-xs text-slate-500">No scanned links found. Run a scan first.</Text>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3"
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="link-outline" size={18} color="#38bdf8" />
                  <Text className="text-slate-50 text-sm ml-2" numberOfLines={1}>
                    {selectedScanUrl || 'Select link to report'}
                  </Text>
                </View>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#94a3b8"
                />
              </TouchableOpacity>

              {showDropdown && (
                <View className="bg-slate-950 border border-slate-800 rounded-xl mt-1.5 overflow-hidden max-h-48">
                  <ScrollView nestedScrollEnabled>
                    {scans.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        className={`p-3 border-b border-slate-800/60 flex-row justify-between items-center ${
                          selectedScanId === item._id ? 'bg-sky-950/40' : ''
                        }`}
                        /* כאשר המשתמש לוחץ על פריט ברשימת הסריקות, מעדכן את מזהה הסריקה וה-
                           URL שלה במצבים הרלוונטיים ומסיר את התפריט הנפתח */
                        onPress={() => {
                          setSelectedScanId(item._id);
                          setSelectedScanUrl(item.url);
                          setShowDropdown(false);
                        }}
                      >
                        <Text
                          className={`text-xs flex-1 mr-2 ${
                            selectedScanId === item._id ? 'text-sky-400 font-bold' : 'text-slate-300'
                          }`}
                          numberOfLines={1}
                        >
                          {item.url}
                        </Text>
                        <Text className="text-[10px] text-slate-500 font-semibold">
                          {item.classification}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Threat Reason</Text>
          <View className="flex-row justify-between">
            {(['Phishing', 'Malware', 'Inappropriate content'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                className={`py-2 px-2.5 rounded-xl border ${
                  reason === r
                    ? 'bg-rose-500/20 border-rose-500'
                    : 'bg-slate-950 border-slate-700'
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    reason === r ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-xs font-semibold text-slate-300 mb-2">Incident Details / Comments</Text>
          <TextInput
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 text-sm h-24"
            placeholder="Describe why this link is dangerous..."
            placeholderTextColor="#64748b"
            value={comments}
            onChangeText={setComments}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className="border border-dashed border-sky-400 rounded-xl py-3.5 flex-row items-center justify-center mb-4 bg-sky-950/20"
          onPress={pickImage}
        >
          <Ionicons
            name={imageUri ? 'image' : 'attach-outline'}
            size={18}
            color="#38bdf8"
          />
          <Text className="text-sky-400 font-semibold text-xs ml-2">
            {imageUri ? 'Screenshot Attached (Tap to Change)' : 'Attach Evidence Screenshot'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <Image source={{ uri: imageUri }} className="w-full h-40 rounded-xl mb-4" />
        )}

        <TouchableOpacity
          className="bg-rose-600 rounded-xl py-3.5 flex-row items-center justify-center space-x-2"
          onPress={handleReportSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#ffffff" />
              <Text className="text-white font-bold text-base ml-2">Submit Threat Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}