//מסך סריקת הקישורים הראשי. המשתמש מזין כתובת אתר ולוחץ על כפתור סריקה. האפליקציה פונה ל-
// API ומציגה כרטיס תוצאות אינטראקטיבי המציג האם הקישור בטוח או מהווה איום, ציון סיכון,
//  סיווג וסיכום מילולי שהופק על ידי ה-AI.

import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../config/api';

// ממשק TypeScript שמגדיר את סוגי התוצאות שהסריקה מחזירה
interface ScanResult {
  url: string;
  classification: string;
  riskScore: number;
  aiExplanation: string;
  isSafe: boolean;
}

// ממשק TypeScript שמגדיר את סוגי הפרופס שהמסך מקבל
interface ScanScreenProps {
  // פונקציה שמופעלת כאשר המשתמש רוצה לעבור למסך היסטוריית הסריקות
  onNavigateToHistory: () => void;
  // פונקציה שמופעלת כאשר המשתמש רוצה להתנתק מהחשבון
  onLogout: () => void;
}

// פונקציה React שמייצגת את מסך הסריקה
export default function ScanScreen({ onNavigateToHistory, onLogout }: ScanScreenProps) {
  // הגדרת מצבים (States) לניהול שדה הקלט של ה-URL, מצב טעינה ותוצאות הסריקה
  const [url, setUrl] = useState('');
  // מצב שמציין אם הבקשה לשרת נמצאת בתהליך טעינה
  const [isLoading, setIsLoading] = useState(false);
  // מצב שמכיל את תוצאות הסריקה שהתקבלו מהשרת
  const [result, setResult] = useState<ScanResult | null>(null);
  
  // פונקציה אסינכרונית שמטפלת בתהליך הסריקה
  const handleScan = async () => {
    // בדיקה אם שדה הקלט ריק, ואם כן מציג הודעת שגיאה למשתמש ומפסיק את התהליך
    if (!url.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid web link to analyze.');
      return;
    }
    // עדכון מצב הטעינה כדי להציג אינדיקטור טעינה למשתמש בזמן שהבקשה לשרת מתבצעת
    setIsLoading(true);
    // איפוס תוצאות הסריקה הקודמות כדי להציג רק את התוצאה החדשה
    setResult(null);

    try {
      // חילוץ הטוקן המאומת מה-AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      // ביצוע בקשת Fetch לשרת ה-Backend עם כתובת האתר שהוזנה על ידי המשתמש
      const response = await fetch(`${API_BASE_URL}/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // המרת כתובת האתר שהוזנה למחרוזת JSON כדי לשלוח אותה בבקשה
        body: JSON.stringify({ url: url.trim() }),
      });
      // המרת התשובה ל-JSON ובדיקת הצלחת הבקשה. אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      const data = await response.json();
      // אם הבקשה נכשלה, זורק שגיאה עם הודעה מתאימה
      if (!response.ok) {
        throw new Error(data.message || 'Scan failed.');
      }
      // אם הבקשה הצליחה, מעדכן את מצב התוצאות עם הנתונים שהתקבלו מהשרת
      const scanData = data.scan;
      setResult({
        url: scanData.url,
        classification: scanData.classification,
        riskScore: Number(scanData.riskScore),
        aiExplanation: scanData.aiExplanation || 'No explanation provided.',
        isSafe: scanData.classification === 'Safe',
      });
    } catch (error: any) {
      // אם הבקשה נכשלה, מציג הודעת שגיאה למשתמש עם ההודעה שהתקבלה מהשרת או הודעה כללית
      Alert.alert('Scan Failed', error.message || 'Unable to analyze the URL.');
    } finally {
      // בסיום הבקשה, גם אם נכשלה, מעדכן את מצב הטעינה כדי להפסיק את האנימציה של אינדיקטור הטעינה
      setIsLoading(false);
    }
  };
 
  return (
    <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <View className="bg-sky-500/10 p-2 rounded-xl border border-sky-500/20 mr-3">
            <Ionicons name="shield-checkmark" size={24} color="#38bdf8" />
          </View>
          <View>
            <Text className="text-2xl font-bold text-sky-400">SafeLink </Text>
            <Text className="text-xs text-slate-400">Real-Time Threat Scanner</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex-row items-center space-x-1"
          onPress={onLogout}
        >
          <Ionicons name="log-out-outline" size={16} color="#fb7185" />
          <Text className="text-xs text-rose-400 font-semibold ml-1">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Input Card */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-5">
        <Text className="text-base font-bold text-slate-50 mb-1">Analyze Target URL</Text>
        <Text className="text-xs text-slate-400 mb-4">Paste suspicious link below to scan </Text>

        <View className="flex-row items-center bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 mb-4">
          <Ionicons name="link-outline" size={18} color="#64748b" />
          <TextInput
            className="flex-1 text-slate-50 text-sm ml-2"
            placeholder="https://secure-account-update.xyz/login"
            placeholderTextColor="#64748b"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          className="bg-sky-600 rounded-xl py-3.5 flex-row items-center justify-center space-x-2"
          onPress={handleScan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="scan-outline" size={20} color="#ffffff" />
              <Text className="text-white font-bold text-base ml-2"> Scan Link</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View
          className={`rounded-2xl p-5 border mb-6 ${
            result.isSafe ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/30 border-rose-500'
          }`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons
                name={result.isSafe ? 'checkmark-circle' : 'warning'}
                size={20}
                color={result.isSafe ? '#34d399' : '#fb7185'}
              />
              <Text className="text-sm font-bold text-slate-200 ml-2">Security Verdict</Text>
            </View>

            <View
              className={`px-3 py-1 rounded-full ${
                result.isSafe ? 'bg-emerald-500/20' : 'bg-rose-500/20'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  result.isSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.isSafe ? 'SAFE LINK' : 'THREAT DETECTED'}
              </Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View className="flex-1 bg-slate-900/80 rounded-xl p-3 mr-2 border border-slate-800">
              <Text className="text-[11px] text-slate-400">Risk Score</Text>
              <Text
                className={`text-xl font-black mt-1 ${
                  result.riskScore > 40 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {result.riskScore}/100
              </Text>
            </View>

            <View className="flex-1 bg-slate-900/80 rounded-xl p-3 border border-slate-800">
              <Text className="text-[11px] text-slate-400">Classification</Text>
              <Text className="text-sm font-bold text-slate-50 mt-1">{result.classification}</Text>
            </View>
          </View>

          <Text className="text-xs font-semibold text-slate-300 mb-1">AI Intelligence Brief:</Text>
          <Text className="text-xs text-slate-400 leading-5">{result.aiExplanation}</Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-slate-900 border border-slate-800 rounded-xl py-3.5 flex-row items-center justify-center mb-8"
        onPress={onNavigateToHistory}
      >
        <Ionicons name="time-outline" size={18} color="#cbd5e1" />
        <Text className="text-slate-300 font-semibold text-sm ml-2">View Scan History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}