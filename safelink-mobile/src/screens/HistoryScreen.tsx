//מסך היסטוריית הסריקות באפליקציית ה-React Native.
//  הוא מושך משרת ה-Backend את רשימת הסריקות של המשתמש בעזרת הטוקן השמור
// , מציג אותן ברכיב FlatList עם אפשרות לרענון במשיכה מטה (RefreshControl), 
// מאפשר מחיקת סריקה, ומציג אינדיקטורים חזותיים בהתאם לרמת הסיכון.

import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

// ממשק TypeScript המייצג פריט היסטוריה של סריקה
interface HistoryItem {
  _id: string;
  url: string;
  riskScore: number;
  classification: string;
  scanDate: string;
}

// פונקציה React שמייצגת את מסך היסטוריית הסריקות
export default function HistoryScreen() {
  // הגדרת מצבים (States) לניהול רשימת ההיסטוריה, מצב טעינה ומצב רענון
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // מצב טעינה שמציין אם הנתונים עדיין נטענים
  const [loading, setLoading] = useState(true);
  // מצב רענון שמציין אם המשתמש מושך את הרשימה מטה כדי לרענן את הנתונים
  const [refreshing, setRefreshing] = useState(false);

  // פונקציה אסינכרונית שמושכת את ההיסטוריה מהשרת
  const fetchHistory = async () => {
    //שולף את הטוקן מ-AsyncStorage, פונה לנתיב ה-history בשרת ושומר את התוצאות.
    try {
      // חילוץ הטוקן המאומת מה-AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      // ביצוע בקשת Fetch לשרת ה-Backend לקבלת ההיסטוריה של הסריקות
      const response = await fetch(`${API_BASE_URL}/scans/history`, {
        // הגדרת כותרות הבקשה, כולל Content-Type והוספת Authorization אם הטוקן קיים
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הצליחה, מעדכן את מצב ההיסטוריה עם הנתונים שהתקבלו.
      const data = await response.json();
      if (response.ok && data.scans) {
        setHistory(data.scans);
      }
      // אם הבקשה נכשלה, מדפיס הודעת שגיאה לטרמינל.
    } catch (error) {
      console.error('History fetch failed:', error);
      // הצגת הודעת שגיאה למשתמש במקרה של כשל ברשת או בעיבוד הבקשה
    } finally {
      // בסיום הבקשה, גם אם נכשלה, מעדכן את מצבי הטעינה והרענון כדי להפסיק את האנימציות המתאימות.
      setLoading(false);
      // אם המשתמש מושך את הרשימה מטה כדי לרענן, מעדכן את מצב הרענון כדי להפסיק את האנימציה.
      setRefreshing(false);
    }
  };

  // פונקציה שמטפלת בבקשה למחיקת סריקה ספציפית על ידי שליחת בקשת DELETE לשרת
  const handleDelete = async (id: string) => {
    try {
      // חילוץ הטוקן המאומת מה-AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      // ביצוע בקשת Fetch לשרת ה-Backend למחיקת הסריקה עם מזהה הסריקה שנבחרה
      const response = await fetch(`${API_BASE_URL}/scans/${id}`, {
        method: 'DELETE',
        headers: {
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // אם הבקשה הצליחה, מעדכן את מצב ההיסטוריה כדי להסיר את הסריקה שנמחקה מהרשימה המוצגת למשתמש
      if (response.ok) {
        // מסנן את רשימת ההיסטוריה ומסיר את הסריקה עם המזהה שנבחר
        setHistory((prev) => prev.filter((item) => item._id !== id));
      } else {
        // אם הבקשה נכשלה, מציג הודעת שגיאה למשתמש
        Alert.alert('Error', 'Failed to delete scan record.');
      }
      // במקרה של שגיאה ברשת או בעיבוד הבקשה, מציג הודעת שגיאה למשתמש
    } catch (error) {
      Alert.alert('Error', 'Network request failed.');
    }
  };

  //מפעיל את שליפת הנתונים בעת פתיחת המסך
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <View className="flex-1 bg-slate-950 p-5">
      <View className="flex-row items-center mb-5">
        <View className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 mr-3">
          <Ionicons name="time" size={24} color="#38bdf8" />
        </View>
        <View>
          <Text className="text-2xl font-bold text-sky-400">Scan Logs</Text>
          <Text className="text-xs text-slate-400">Audit trail of previously analyzed URLs</Text>
        </View>
      </View>
       
      {loading ? (
        <View className="flex-1 justify-center items-center">
          {/* מציג אינדיקטור טעינה בזמן שהנתונים נטענים מהשרת */}
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        /* מציג את רשימת ההיסטוריה של הסריקות ברכיב FlatList עם אפשרות לרענון במשיכה מטה */
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
          refreshControl={
            /* מאפשר למשתמש לרענן את הרשימה על ידי משיכת המסך מטה, ומפעיל את הפונקציה fetchHistory */
            <RefreshControl
              refreshing={refreshing}
              /* בעת רענון, מפעיל את הפונקציה fetchHistory ומעדכן את מצב הרענון */
              onRefresh={() => {
                // מעדכן את מצב הרענון כדי להפעיל את האנימציה של הרענון
                setRefreshing(true);
                // מפעיל את הפונקציה fetchHistory כדי לשלוף את הנתונים מהשרת מחדש
                fetchHistory();
              }}
              tintColor="#38bdf8"
            />
          }
          /* מציג הודעה למשתמש אם אין סריקות להציג ברשימה */
          ListEmptyComponent={
            <View className="py-16 items-center">
              <Ionicons name="folder-open-outline" size={48} color="#475569" />
              <Text className="text-slate-500 text-sm mt-3">No scans performed yet.</Text>
            </View>
          }
          /* פונקציה שמציגה כל פריט ברשימה עם אינדיקטורים חזותיים בהתאם לרמת הסיכון של הסריקה */
          renderItem={({ item }) => {
            // קובע אם הסריקה נחשבת למסוכנת לפי ציון הסיכון שלה
            const isMalicious = item.riskScore > 40;
            return (
              <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1 mr-2">
                    <Ionicons
                      name={isMalicious ? 'alert-circle' : 'shield-checkmark'}
                      size={18}
                      color={isMalicious ? '#fb7185' : '#34d399'}
                    />
                    <Text className="text-slate-50 font-bold text-sm ml-2 flex-1" numberOfLines={1}>
                      {item.url}
                    </Text>
                  </View>

                  <View
                    className={`px-2.5 py-1 rounded-xl ${
                      isMalicious ? 'bg-rose-500/20' : 'bg-emerald-500/20'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        isMalicious ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {/* מציג את הסיווג של הסריקה בהתאם להחלטת ה-AI או לפי בדיקה מקומית (heuristic check) אם אין החלטה מה-AI */}
                      {item.classification || (isMalicious ? 'Threat' : 'Clean')}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-slate-800">
                  <Text className="text-xs text-slate-400">
                    {/* מציג את ציון הסיכון של הסריקה (Risk Score) שהתקבל מה-AI או מהבדיקה המקומית (heuristic check) */}
                    Risk: <Text className="font-bold text-slate-50">{item.riskScore}/100</Text>
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-[11px] text-slate-500 mr-3">
                      {/* מציג את תאריך הסריקה בפורמט קריא למשתמש */}
                      {new Date(item.scanDate).toLocaleDateString()}
                    </Text>
                    {/* מאפשר למשתמש למחוק סריקה ספציפית על ידי לחיצה על כפתור המחיקה, ומפעיל את הפונקציה handleDelete עם מזהה הסריקה */}
                    <TouchableOpacity
                      className="flex-row items-center"
                      /* מפעיל את הפונקציה handleDelete כאשר לוחצים על כפתור המחיקה */
                      onPress={() => handleDelete(item._id)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#fb7185" />
                      <Text className="text-xs text-rose-400 font-bold ml-1">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}